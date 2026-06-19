import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

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

  // Создаём Excel файл через exceljs (безопасная, поддерживаемая библиотека)
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Лиды')

  ws.columns = [
    { header: '№', key: 'num', width: 5 },
    { header: 'Имя', key: 'name', width: 20 },
    { header: 'Телефон', key: 'phone', width: 18 },
    { header: 'Город', key: 'city', width: 15 },
    { header: 'Статус', key: 'status', width: 15 },
    { header: 'Менеджер', key: 'manager', width: 20 },
    { header: 'Источник', key: 'source', width: 12 },
    { header: 'Комментариев', key: 'comments', width: 12 },
    { header: 'Дата создания', key: 'createdAt', width: 18 },
  ]

  // Жирный заголовок
  ws.getRow(1).font = { bold: true }

  leads.forEach((lead: (typeof leads)[number], index: number) => {
    ws.addRow({
      num: index + 1,
      name: lead.name,
      phone: lead.phone,
      city: lead.city || '-',
      status: statusLabels[lead.status] || lead.status,
      manager: lead.assignedTo?.name || '-',
      source: lead.source,
      comments: lead._count.comments,
      createdAt: new Date(lead.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    })
  })

  const buf = await wb.xlsx.writeBuffer()

  return new NextResponse(buf as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  })
}
