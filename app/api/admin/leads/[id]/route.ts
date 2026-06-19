import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// LeadStatus type from schema
type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'CALL_SCHEDULED' | 'ACCEPTED' | 'REJECTED' | 'NO_ANSWER'

// GET /api/admin/leads/[id] - Получить лид по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } }
        }
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        include: {
          changedBy: { select: { id: true, name: true } }
        }
      }
    }
  })

  if (!lead) {
    return NextResponse.json({ error: 'Лид не найден' }, { status: 404 })
  }

  return NextResponse.json({ lead })
}

// PATCH /api/admin/leads/[id] - Обновить лид
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status, assignedToId, name, phone, city } = body

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  // Получаем текущий лид
  const currentLead = await prisma.lead.findUnique({
    where: { id },
    select: { status: true }
  })

  if (!currentLead) {
    return NextResponse.json({ error: 'Лид не найден' }, { status: 404 })
  }

  // Подготавливаем данные для обновления
  const updateData: Record<string, unknown> = {}
  
  if (name !== undefined) updateData.name = name
  if (phone !== undefined) updateData.phone = phone
  if (city !== undefined) updateData.city = city
  if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null
  if (status !== undefined) updateData.status = status as LeadStatus

  // Обновляем лид
  const lead = await prisma.lead.update({
    where: { id },
    data: updateData,
    include: {
      assignedTo: { select: { id: true, name: true } }
    }
  })

  // Если изменился статус, записываем в историю
  if (status && status !== currentLead.status) {
    await prisma.statusHistory.create({
      data: {
        leadId: id,
        oldStatus: currentLead.status,
        newStatus: status as LeadStatus,
        changedById: user.userId
      }
    })
  }

  return NextResponse.json({ lead })
}

// DELETE /api/admin/leads/[id] - Удалить лид (только админ)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Только админ может удалять лиды' }, { status: 403 })
  }

  const { id } = await params

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  await prisma.lead.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
