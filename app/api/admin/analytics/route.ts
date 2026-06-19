import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// GET /api/admin/analytics - Получить аналитику по UTM (только для админов)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') || '30' // дней

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  // Получаем все лиды за период с UTM данными
  const leads = await prisma.lead.findMany({
    where: {
      createdAt: { gte: startDate }
    },
    select: {
      id: true,
      name: true,
      phone: true,
      city: true,
      status: true,
      createdAt: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      utmTerm: true,
      utmContent: true,
      fbclid: true,
      fbp: true,
      fbc: true,
      referrer: true,
      landingPage: true,
      userAgent: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  // Группируем по источникам
  const bySource: Record<string, number> = {}
  const byMedium: Record<string, number> = {}
  const byCampaign: Record<string, number> = {}
  const bySourceMedium: Record<string, number> = {}

  let facebookLeads = 0
  let directLeads = 0
  let organicLeads = 0

  leads.forEach(lead => {
    // По источнику
    const source = lead.utmSource || (lead.fbclid ? 'facebook' : 'direct')
    bySource[source] = (bySource[source] || 0) + 1

    // По типу трафика
    const medium = lead.utmMedium || (lead.fbclid ? 'cpc' : 'none')
    byMedium[medium] = (byMedium[medium] || 0) + 1

    // По кампании
    if (lead.utmCampaign) {
      byCampaign[lead.utmCampaign] = (byCampaign[lead.utmCampaign] || 0) + 1
    }

    // Комбинация источник/канал
    const sourceMedium = `${source} / ${medium}`
    bySourceMedium[sourceMedium] = (bySourceMedium[sourceMedium] || 0) + 1

    // Специальные счетчики
    if (lead.fbclid || lead.utmSource === 'facebook' || lead.utmSource === 'fb' || lead.utmSource === 'instagram' || lead.utmSource === 'ig') {
      facebookLeads++
    } else if (!lead.utmSource && !lead.referrer) {
      directLeads++
    } else if (lead.referrer && !lead.utmSource) {
      organicLeads++
    }
  })

  // Сортируем и конвертируем в массивы для графиков
  const sortByValue = (obj: Record<string, number>) => 
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

  return NextResponse.json({
    total: leads.length,
    facebookLeads,
    directLeads,
    organicLeads,
    bySource: sortByValue(bySource),
    byMedium: sortByValue(byMedium),
    byCampaign: sortByValue(byCampaign),
    bySourceMedium: sortByValue(bySourceMedium),
    leads: leads.map(lead => ({
      ...lead,
      source: lead.utmSource || (lead.fbclid ? 'Facebook Ads' : 'Прямой заход'),
      sourceMedium: `${lead.utmSource || (lead.fbclid ? 'facebook' : 'direct')} / ${lead.utmMedium || (lead.fbclid ? 'cpc' : 'none')}`
    }))
  })
}
