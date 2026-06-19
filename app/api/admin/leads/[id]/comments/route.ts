import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// POST /api/admin/leads/[id]/comments - Добавить комментарий
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { text } = body

  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'Текст комментария обязателен' }, { status: 400 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  // Проверяем что лид существует
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) {
    return NextResponse.json({ error: 'Лид не найден' }, { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: {
      text: text.trim(),
      leadId: id,
      authorId: user.userId
    },
    include: {
      author: { select: { id: true, name: true } }
    }
  })

  return NextResponse.json({ comment })
}
