import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// GET /api/admin/leads - Получить список лидов
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const skip = (page - 1) * limit

  // Фильтры
  const where: Record<string, unknown> = {}
  
  if (status && status !== 'all') {
    where.status = status
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { city: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { comments: true } }
      }
    }),
    prisma.lead.count({ where })
  ])

  return NextResponse.json({
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}

// POST /api/admin/leads - Создать лид (из внешнего API тоже)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, city, source = 'website' } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Имя и телефон обязательны' },
        { status: 400 }
      )
    }

    const prisma = getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        city,
        source,
        status: 'NEW'
      }
    })

    // Создаем запись в истории статусов (без changedById - системное создание)
    await prisma.statusHistory.create({
      data: {
        leadId: lead.id,
        newStatus: 'NEW',
      }
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('[v0] Create lead error:', error)
    return NextResponse.json(
      { error: 'Ошибка создания лида' },
      { status: 500 }
    )
  }
}
