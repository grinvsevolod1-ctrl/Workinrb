import { NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// Статусы лидов
const STATUSES = {
  NEW: { label: 'Новый', emoji: '🆕' },
  IN_PROGRESS: { label: 'В работе', emoji: '⏳' },
  CALL_SCHEDULED: { label: 'Созвон назначен', emoji: '📅' },
  ACCEPTED: { label: 'Принят', emoji: '✅' },
  REJECTED: { label: 'Отказ', emoji: '❌' },
  NO_ANSWER: { label: 'Не отвечает', emoji: '📵' },
}

type LeadStatus = keyof typeof STATUSES

// Хранилище ожидающих комментариев: chatId:userId -> { leadId, messageId, expiresAt }
// В production лучше использовать Redis, но для простоты используем Map
const pendingComments = new Map<string, { leadId: string; messageId: number; expiresAt: number }>()

// Очистка просроченных ожиданий (5 минут)
function cleanupPendingComments() {
  const now = Date.now()
  for (const [key, value] of pendingComments.entries()) {
    if (value.expiresAt < now) {
      pendingComments.delete(key)
    }
  }
}

// Обработка webhook от Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Периодически чистим просроченные ожидания
    cleanupPendingComments()
    
    // Обработка callback_query (нажатие на inline кнопку)
    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query)
    }
    
    // Обработка обычных сообщений
    if (body.message && body.message.text) {
      // Сначала проверяем, ожидается ли комментарий от этого пользователя
      const handled = await handlePendingComment(body.message)
      
      // Если не было ожидания комментария, проверяем reply
      if (!handled && body.message.reply_to_message) {
        await handleReplyMessage(body.message)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error)
    return NextResponse.json({ ok: true }) // Всегда возвращаем 200 чтобы Telegram не retry
  }
}

// Обработка ожидающего комментария
async function handlePendingComment(message: any): Promise<boolean> {
  const prisma = getPrisma()
  if (!prisma) return false

  const chatId = message.chat.id
  const userId = message.from.id
  const text = message.text
  const fromUser = message.from

  // Проверяем есть ли ожидающий комментарий для этого пользователя в этом чате
  const key = `${chatId}:${userId}`
  const pending = pendingComments.get(key)

  if (!pending) return false

  // Удаляем из ожидания
  pendingComments.delete(key)

  // Проверяем не истекло ли время
  if (pending.expiresAt < Date.now()) {
    return false
  }

  // Добавляем комментарий к лиду
  let systemUser = await prisma.user.findFirst({
    where: { email: 'telegram@system' }
  })

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'telegram@system',
        password: 'disabled',
        name: 'Telegram Bot',
        role: 'MANAGER',
        isActive: false
      }
    })
  }

  const authorName = fromUser.first_name || fromUser.username || 'Telegram'

  await prisma.comment.create({
    data: {
      leadId: pending.leadId,
      authorId: systemUser.id,
      text: `[${authorName}]: ${text}`
    }
  })

  // Подтверждаем добавление комментария
  await sendMessage(chatId, `✅ Комментарий добавлен к лиду`, message.message_id)

  // Обновляем сообщение с лидом чтобы показать новый комментарий
  const lead = await prisma.lead.findUnique({
    where: { id: pending.leadId },
    include: {
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  })

  if (lead) {
    await updateLeadMessage(chatId, pending.messageId, lead, lead.status)
  }

  return true
}

// Обработка нажатия на кнопку
async function handleCallbackQuery(query: any) {
  const prisma = getPrisma()
  if (!prisma) return

  const { id: callbackId, data, message, from } = query
  const chatId = message?.chat?.id
  const messageId = message?.message_id
  const userId = from?.id

  if (!data || !chatId || !messageId) return

  // Парсим данные кнопки: action:leadId:value
  const [action, leadId, value] = data.split(':')

  if (action === 'status' && leadId && value) {
    // Меняем статус лида
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      await answerCallback(callbackId, 'Лид не найден')
      return
    }

    const oldStatus = lead.status
    const newStatus = value as LeadStatus

    // Обновляем статус
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStatus }
    })

    // Записываем в историю (без userId т.к. это из Telegram)
    await prisma.statusHistory.create({
      data: {
        leadId,
        oldStatus,
        newStatus
      }
    })

    // Обновляем сообщение с новым статусом
    await updateLeadMessage(chatId, messageId, lead, newStatus)
    await answerCallback(callbackId, `Статус изменен: ${STATUSES[newStatus].label}`)
  }

  if (action === 'comment' && leadId) {
    // Сохраняем ожидание комментария для этого пользователя
    const key = `${chatId}:${userId}`
    pendingComments.set(key, {
      leadId,
      messageId,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 минут на ввод комментария
    })

    // Уведомляем пользователя
    await answerCallback(callbackId, '📝 Напишите комментарий следующим сообщением (5 мин)', true)
  }

  if (action === 'refresh' && leadId) {
    // Обновляем информацию о лиде
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    })
    if (lead) {
      await updateLeadMessage(chatId, messageId, lead, lead.status)
      await answerCallback(callbackId, 'Обновлено')
    }
  }
}

// Обработка ответа на сообщение (комментарий через reply)
async function handleReplyMessage(message: any) {
  const prisma = getPrisma()
  if (!prisma) return

  const chatId = message.chat.id
  const replyToMessageId = message.reply_to_message.message_id
  const text = message.text
  const fromUser = message.from

  if (!text) return

  // Ищем сообщение в БД чтобы найти leadId
  const chat = await prisma.telegramChat.findFirst({
    where: { chatId: String(chatId), type: 'GROUP' }
  })

  if (!chat) return

  const tgMessage = await prisma.telegramMessage.findFirst({
    where: {
      chatId: chat.id,
      messageId: String(replyToMessageId)
    }
  })

  if (!tgMessage || !tgMessage.leadId) return

  // Добавляем комментарий к лиду
  let systemUser = await prisma.user.findFirst({
    where: { email: 'telegram@system' }
  })

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'telegram@system',
        password: 'disabled',
        name: 'Telegram Bot',
        role: 'MANAGER',
        isActive: false
      }
    })
  }

  const authorName = fromUser.first_name || fromUser.username || 'Telegram'

  await prisma.comment.create({
    data: {
      leadId: tgMessage.leadId,
      authorId: systemUser.id,
      text: `[${authorName}]: ${text}`
    }
  })

  // Подтверждаем добавление комментария
  await sendMessage(chatId, `✅ Комментарий добавлен к лиду`, message.message_id)
}

// Обновить сообщение с лидом
async function updateLeadMessage(chatId: number, messageId: number, lead: any, status: LeadStatus) {
  const statusInfo = STATUSES[status]
  
  const commentsText = lead.comments?.length 
    ? `\n💬 <b>Комментарии:</b>\n${lead.comments.map((c: any) => `• ${c.text}`).join('\n')}`
    : ''
  
  const text = `
🔔 <b>Лид #${lead.id.slice(-6)}</b>

👤 <b>Имя:</b> ${escapeHtml(lead.name)}
📱 <b>Телефон:</b> ${escapeHtml(lead.phone)}
${lead.city ? `📍 <b>Город:</b> ${escapeHtml(lead.city)}` : ''}

${statusInfo.emoji} <b>Статус:</b> ${statusInfo.label}
${commentsText}
`.trim()

  const keyboard = buildInlineKeyboard(lead.id, status)

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  })
}

// Построить inline клавиатуру
export function buildInlineKeyboard(leadId: string, currentStatus?: LeadStatus) {
  const statusButtons = Object.entries(STATUSES).map(([key, val]) => ({
    text: currentStatus === key ? `• ${val.label}` : val.label,
    callback_data: `status:${leadId}:${key}`
  }))

  // Разбиваем на ряды по 3 кнопки
  const rows = []
  for (let i = 0; i < statusButtons.length; i += 3) {
    rows.push(statusButtons.slice(i, i + 3))
  }

  // Добавляем кнопки комментария и обновления
  rows.push([
    { text: '💬 Комментарий', callback_data: `comment:${leadId}` },
    { text: '🔄 Обновить', callback_data: `refresh:${leadId}` }
  ])

  return { inline_keyboard: rows }
}

// Ответить на callback
async function answerCallback(callbackId: string, text: string, showAlert = false) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackId,
      text,
      show_alert: showAlert
    })
  })
}

// Отправить сообщение
async function sendMessage(chatId: number, text: string, replyToMessageId?: number) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_to_message_id: replyToMessageId
    })
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
