import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"

// GET - получить список чатов
export async function GET() {
  try {
    const user = await getCurrentUser()
    console.log('[Telegram API] GET request, user:', user?.email || 'not authenticated')
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const prisma = getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const chats = await prisma.telegramChat.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('[Telegram API] Found chats:', chats.length)
    return NextResponse.json({ chats })
  } catch (error) {
    console.error('[Telegram API] GET error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST - добавить новый чат
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    console.log('[Telegram API] POST request, user:', user?.email || 'not authenticated')
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const prisma = getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const body = await request.json()
    const { chatId, name, type } = body
    console.log('[Telegram API] Creating chat:', { chatId, name, type })

    if (!chatId || !name) {
      return NextResponse.json({ error: 'Chat ID и название обязательны' }, { status: 400 })
    }

    // Валидация типа
    if (type && !['MANAGER', 'GROUP'].includes(type)) {
      return NextResponse.json({ error: 'Неверный тип чата. Допустимые: MANAGER, GROUP' }, { status: 400 })
    }

    // Проверяем что чат не существует
    const existing = await prisma.telegramChat.findUnique({
      where: { chatId: String(chatId) }
    })

    if (existing) {
      return NextResponse.json({ error: 'Чат с таким ID уже существует' }, { status: 400 })
    }

    const chat = await prisma.telegramChat.create({
      data: {
        chatId: String(chatId),
        name,
        type: type || 'MANAGER',
        isActive: true
      }
    })

    console.log('[Telegram API] Chat created:', chat.id)
    return NextResponse.json({ chat })
  } catch (error) {
    console.error('[Telegram API] POST error:', error)
    return NextResponse.json({ error: 'Ошибка создания чата' }, { status: 500 })
  }
}
