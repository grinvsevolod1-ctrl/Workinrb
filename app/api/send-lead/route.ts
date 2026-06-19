import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { buildInlineKeyboard } from '@/app/api/telegram/webhook/route'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getSettings } from '@/lib/settings'
import crypto from 'crypto'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const FB_PIXEL_ID = process.env.FB_PIXEL_ID
const FB_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN
const FB_API_VERSION = "v22.0"

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex')
}

// Отправка обычного сообщения (без кнопок)
async function sendTelegramMessage(chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  })
  return response.ok
}

// Отправка интерактивного сообщения (с кнопками)
async function sendInteractiveMessage(chatId: string, text: string, leadId: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text + '\n\n<i>Ответьте на это сообщение чтобы добавить комментарий</i>',
      parse_mode: 'HTML',
      reply_markup: buildInlineKeyboard(leadId, 'NEW'),
    }),
  })
  if (response.ok) {
    const data = await response.json()
    return data.result?.message_id
  }
  return null
}

// Отправка серверного события в Facebook Conversions API
async function sendFacebookServerEvent(eventData: {
  event_name: string
  event_time: number
  user_data: Record<string, any>
  custom_data?: Record<string, any>
  action_source: string
  event_source_url: string
  fbp?: string
  fbc?: string
}, pixelId?: string) {
  const effectivePixelId = pixelId || FB_PIXEL_ID
  if (!FB_ACCESS_TOKEN || !effectivePixelId) {
    console.log('[FB CAPI] Token or Pixel ID not configured, skipping')
    return false
  }
  try {
    const payload: any = {
      data: [{
        event_name: eventData.event_name,
        event_time: eventData.event_time,
        action_source: eventData.action_source,
        event_source_url: eventData.event_source_url,
        user_data: eventData.user_data,
        custom_data: eventData.custom_data,
      }]
    }
    if (eventData.fbp) payload.data[0].user_data.fbp = eventData.fbp
    if (eventData.fbc) payload.data[0].user_data.fbc = eventData.fbc

    const url = `https://graph.facebook.com/${FB_API_VERSION}/${effectivePixelId}/events?access_token=${FB_ACCESS_TOKEN}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    console.log('[FB CAPI] Response:', JSON.stringify(result))
    return response.ok
  } catch (error) {
    console.error('[FB CAPI] Error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Защита от спама заявок: не более 5 отправок за 10 минут с одного IP.
    const ip = getClientIp(request)
    const limit = rateLimit(`lead:${ip}`, 5, 10 * 60 * 1000)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Слишком много заявок. Попробуйте позже.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      name,
      phone,
      message,
      utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
      fbclid, fbp, fbc,
      referrer, landingPage, userAgent
    } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    // Сохраняем в БД
    let lead = null
    let dbError = false
    const prisma = getPrisma()
    try {
      lead = prisma ? await prisma.lead.create({
        data: {
          name, phone,
          city: message || null,
          source: utmSource || 'website',
          status: 'NEW',
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmTerm: utmTerm || null,
          utmContent: utmContent || null,
          fbclid: fbclid || null,
          fbp: fbp || null,
          fbc: fbc || null,
          referrer: referrer || null,
          landingPage: landingPage || null,
          userAgent: userAgent || null,
        }
      }) : null
    } catch (err) {
      dbError = true
      console.error('[v0] Database error (lead not saved):', err)
    }

    // Facebook Conversions API
    const eventTime = Math.floor(Date.now() / 1000)
    const sourceUrl = landingPage || 'https://workinrb.top'
    const cleanPhone = phone.replace(/\D/g, '')
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''

    sendFacebookServerEvent({
      event_name: 'Lead',
      event_time: eventTime,
      action_source: 'website',
      event_source_url: sourceUrl,
      user_data: {
        ph: cleanPhone ? [sha256(cleanPhone)] : undefined,
        fn: name ? [sha256(name)] : undefined,
        client_ip_address: clientIp || undefined,
        client_user_agent: userAgent || undefined,
      },
      custom_data: { value: '0.00', currency: 'BYN' },
      fbp: fbp || undefined,
      fbc: fbc || undefined,
    }).catch(err => console.error('[FB CAPI] Failed:', err))

    // Форматируем сообщение для Telegram
    const currentDate = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    let sourceDisplay = 'Прямой заход'
    if (utmSource) sourceDisplay = `${utmSource}${utmMedium ? ` / ${utmMedium}` : ''}`
    else if (fbclid) sourceDisplay = 'Facebook Ads'

    const leadMessage = `
🔔 <b>Новая заявка с сайта workinrb.top</b>
${lead ? `🆔 <b>ID:</b> ${lead.id}` : ''}

👤 <b>Имя:</b> ${escapeHtml(name)}
📱 <b>Телефон:</b> ${escapeHtml(phone)}
${message ? `📍 <b>Город:</b> ${escapeHtml(message)}` : ''}

📊 <b>Источник:</b> ${sourceDisplay}
${utmCampaign ? `📢 <b>Кампания:</b> ${escapeHtml(utmCampaign)}` : ''}
📅 <b>Дата:</b> ${currentDate}
`.trim()

    // Отправляем в Telegram чаты из БД
    let telegramDelivered = false
    if (TELEGRAM_BOT_TOKEN && prisma) {
      try {
        const activeChats = await prisma.telegramChat.findMany({
          where: { isActive: true }
        })

        for (const chat of activeChats) {
          try {
            let telegramMessageId: number | null = null
            
            if (chat.type === 'GROUP') {
              // В группы отправляем с кнопками
              telegramMessageId = await sendInteractiveMessage(chat.chatId, leadMessage, lead?.id || '')
              if (telegramMessageId) telegramDelivered = true
            } else {
              // Менеджерам — обычное сообщение
              const ok = await sendTelegramMessage(chat.chatId, leadMessage)
              if (ok) telegramDelivered = true
            }

            // Сохраняем сообщение в БД для связи с лидом (важно для комментариев)
            if (lead?.id && telegramMessageId) {
              await prisma.telegramMessage.create({
                data: {
                  messageId: String(telegramMessageId),
                  text: leadMessage,
                  leadId: lead.id,
                  chatId: chat.id,
                }
              }).catch((err: unknown) => console.error('[v0] Failed to save TG message:', err))
            }
          } catch (err) {
            console.error(`[v0] Failed to send to chat ${chat.chatId}:`, err)
          }
        }

        // Обновляем счётчик лидов у чатов
        await prisma.telegramChat.updateMany({
          where: { isActive: true },
          data: { leadCount: { increment: 1 } }
        }).catch(() => {})
      } catch (err) {
        console.error('[v0] Telegram chats error:', err)
      }
    }

    // Лид считается потерянным, только если его не удалось ни сохранить в БД,
    // ни доставить хотя бы в один Telegram-чат. В этом случае возвращаем ошибку,
    // чтобы клиент не показывал ложное "Заявка отправлена".
    if (!lead && !telegramDelivered) {
      console.error('[v0] Lead LOST: not saved to DB and not delivered to Telegram', { name, phone })
      return NextResponse.json(
        { error: 'Не удалось сохранить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, leadId: lead?.id, saved: !!lead && !dbError })
  } catch (error) {
    console.error('[v0] Error sending lead:', error)
    return NextResponse.json({ error: 'Ошибка отправки' }, { status: 500 })
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
