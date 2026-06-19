import { getPrisma } from './prisma'

// Все настройки сайта, управляемые из админки.
// Контент лендинга, контакты, ID трекеров и переключатели функций.
export interface SiteSettings {
  // Hero — главный экран
  heroBadgeText: string
  heroBadgeHighlight: string
  heroHeadingLine1: string
  heroSalaryText: string
  heroSubtitlePrefix: string
  heroMenOnlyBadge: string
  heroSubtitleSuffix: string
  heroStat1Value: string
  heroStat1Label: string
  heroStat2Value: string
  heroStat2Label: string
  heroStat3Value: string
  heroStat3Label: string

  // Контакты
  contactPhone: string
  telegramLink: string

  // Трекинг
  yandexMetrikaId: string
  metaPixelId: string

  // Переключатели функций
  telegramNotificationsEnabled: boolean
  facebookCapiEnabled: boolean
  metaPixelEnabled: boolean
  yandexMetrikaEnabled: boolean
  leadFormEnabled: boolean
}

// Значения по умолчанию — совпадают с текущим хардкодом на сайте.
export const DEFAULT_SETTINGS: SiteSettings = {
  heroBadgeText: 'Набор открыт',
  heroBadgeHighlight: 'старт через 3 дня',
  heroHeadingLine1: 'Честная работа',
  heroSalaryText: '100 BYN / день',
  heroSubtitlePrefix: 'Подсобные работы в Москве',
  heroMenOnlyBadge: 'ТОЛЬКО ДЛЯ МУЖЧИН',
  heroSubtitleSuffix: 'Вахта от 30 дней. Жильё и питание за наш счёт.',
  heroStat1Value: '500+',
  heroStat1Label: 'человек работают',
  heroStat2Value: '7',
  heroStat2Label: 'лет на рынке',
  heroStat3Value: '0',
  heroStat3Label: 'задержек выплат',

  contactPhone: '',
  telegramLink: '',

  yandexMetrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '109238611',
  metaPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',

  telegramNotificationsEnabled: true,
  facebookCapiEnabled: true,
  metaPixelEnabled: true,
  yandexMetrikaEnabled: true,
  leadFormEnabled: true,
}

const SETTINGS_KEY = 'site'

// Сливаем сохранённые значения поверх дефолтов, отбрасывая неизвестные ключи.
function mergeWithDefaults(stored: Partial<SiteSettings> | null): SiteSettings {
  if (!stored) return { ...DEFAULT_SETTINGS }
  const result = { ...DEFAULT_SETTINGS }
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    if (stored[key] !== undefined && stored[key] !== null) {
      // @ts-expect-error — типы согласованы по ключу
      result[key] = stored[key]
    }
  }
  return result
}

// Чтение настроек (сервер). Без БД возвращает дефолты.
export async function getSettings(): Promise<SiteSettings> {
  const prisma = getPrisma()
  if (!prisma) return { ...DEFAULT_SETTINGS }

  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } })
    if (!row) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(row.value) as Partial<SiteSettings>
    return mergeWithDefaults(parsed)
  } catch (err) {
    console.error('[settings] Failed to read settings:', err)
    return { ...DEFAULT_SETTINGS }
  }
}

// Запись настроек (сервер, только для админа на уровне API).
export async function saveSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
  const prisma = getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  // Берём текущие, накладываем изменения, валидируем по схеме дефолтов.
  const current = await getSettings()
  const merged = mergeWithDefaults({ ...current, ...input })

  await prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: JSON.stringify(merged) },
    update: { value: JSON.stringify(merged) },
  })

  return merged
}
