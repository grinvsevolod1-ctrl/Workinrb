import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// PATCH /api/admin/users/[id] - Обновить пользователя
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, role, isActive, password } = body

  const updateData: Record<string, unknown> = {}
  
  if (name !== undefined) updateData.name = name
  if (role !== undefined) updateData.role = role
  if (isActive !== undefined) updateData.isActive = isActive
  if (password) updateData.password = await hashPassword(password)

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })

  return NextResponse.json({ user: updatedUser })
}

// DELETE /api/admin/users/[id] - Удалить пользователя
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const { id } = await params

  // Нельзя удалить себя
  if (id === user.userId) {
    return NextResponse.json({ error: 'Нельзя удалить свой аккаунт' }, { status: 400 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
