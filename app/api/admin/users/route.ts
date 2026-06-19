import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// GET /api/admin/users - Получить список пользователей
export async function GET() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { assignedLeads: true, comments: true } }
    }
  })

  return NextResponse.json({ users })
}

// POST /api/admin/users - Создать пользователя
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const body = await request.json()
  const { email, password, name, role } = body

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Email, пароль и имя обязательны' }, { status: 400 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  // Проверяем что email не занят
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 })
  }

  const hashedPassword = await hashPassword(password)

  const newUser = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'MANAGER'
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })

  return NextResponse.json({ user: newUser })
}
