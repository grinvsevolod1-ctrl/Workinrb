import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getSettings, saveSettings } from '@/lib/settings'

// GET /api/admin/settings — текущие настройки (админ и менеджер видят, меняет только админ)
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await getSettings()
  return NextResponse.json({ settings })
}

// PUT /api/admin/settings — сохранить настройки (только админ)
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const settings = await saveSettings(body)
    return NextResponse.json({ success: true, settings })
  } catch (err) {
    console.error('[settings] Save error:', err)
    const message = err instanceof Error ? err.message : 'Ошибка сохранения'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
