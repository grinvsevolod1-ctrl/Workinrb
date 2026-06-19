import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

const statusLabels: Record<string, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  CALL_SCHEDULED: "Созвон назначен",
  ACCEPTED: "Принят",
  REJECTED: "Отказ",
  NO_ANSWER: "Не отвечает",
}

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  // Получаем все лиды
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assignedTo: { select: { name: true } },
      _count: { select: { comments: true } }
    }
  })

  // Формируем данные для Excel
  const data = leads.map((lead, index) => ({
    '№': index + 1,
    'Имя': lead.name,
    'Телефон': lead.phone,
    'Город': lead.city || '-',
    'Статус': statusLabels[lead.status] || lead.status,
    'Менеджер': lead.assignedTo?.name || '-',
    'Источник': lead.source,
    'Комментариев': lead._count.comments,
    'Дата создания': new Date(lead.createdAt).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  }))

  // Создаем Excel файл
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Устанавливаем ширину колонок
  ws['!cols'] = [
    { wch: 5 },   // №
    { wch: 20 },  // Имя
    { wch: 18 },  // Телефон
    { wch: 15 },  // Город
    { wch: 15 },  // Статус
    { wch: 20 },  // Менеджер
    { wch: 10 },  // Источник
    { wch: 12 },  // Комментариев
    { wch: 18 },  // Дата
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Лиды')

  // Генерируем buffer
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  })
}
