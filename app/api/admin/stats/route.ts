import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  // Получаем текущую дату и даты для фильтрации
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1) // Понедельник
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Параллельные запросы для статистики
  const [
    totalLeads,
    newLeads,
    inProgressLeads,
    acceptedLeads,
    rejectedLeads,
    todayLeads,
    weekLeads,
    monthLeads,
    recentLeads,
    statusDistribution
  ] = await Promise.all([
    // Общее количество лидов
    prisma.lead.count(),
    // Новые лиды
    prisma.lead.count({ where: { status: 'NEW' } }),
    // В работе
    prisma.lead.count({ where: { status: 'IN_PROGRESS' } }),
    // Принятые
    prisma.lead.count({ where: { status: 'ACCEPTED' } }),
    // Отказы
    prisma.lead.count({ where: { status: 'REJECTED' } }),
    // За сегодня
    prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
    // За неделю
    prisma.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
    // За месяц
    prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    // Последние 10 лидов
    prisma.lead.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { name: true } }
      }
    }),
    // Распределение по статусам
    prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true }
    })
  ])

  // Конверсия (принятые / всего * 100)
  const conversionRate = totalLeads > 0 
    ? Math.round((acceptedLeads / totalLeads) * 100) 
    : 0

  return NextResponse.json({
    stats: {
      total: totalLeads,
      new: newLeads,
      inProgress: inProgressLeads,
      accepted: acceptedLeads,
      rejected: rejectedLeads,
      today: todayLeads,
      week: weekLeads,
      month: monthLeads,
      conversionRate
    },
    recentLeads,
    statusDistribution: statusDistribution.map((s: (typeof statusDistribution)[number]) => ({
      status: s.status,
      count: s._count.status
    }))
  })
}
