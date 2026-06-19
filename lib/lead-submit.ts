// Клиентская логика отправки заявки с защитой от повторной отправки.
// Запоминаем отправленные номера в localStorage на 24 часа, чтобы один и тот же
// человек с того же устройства не отправлял дубликаты (за которые платим рекламе).

const STORAGE_KEY = "workinrb_submitted_phones"
const WINDOW_MS = 24 * 60 * 60 * 1000

type SubmittedMap = Record<string, number> // нормализованный телефон -> timestamp

function readMap(): SubmittedMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SubmittedMap
    // Чистим устаревшие записи
    const now = Date.now()
    const cleaned: SubmittedMap = {}
    for (const [phone, ts] of Object.entries(parsed)) {
      if (now - ts < WINDOW_MS) cleaned[phone] = ts
    }
    return cleaned
  } catch {
    return {}
  }
}

function writeMap(map: SubmittedMap) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // localStorage может быть недоступен (приватный режим) — не критично
  }
}

// Простая нормализация на клиенте: только цифры (для ключа localStorage).
function phoneKey(phone: string): string {
  return (phone || "").replace(/\D/g, "")
}

// Был ли этот номер отправлен за последние 24 часа с этого устройства.
export function wasRecentlySubmitted(phone: string): boolean {
  const key = phoneKey(phone)
  if (!key) return false
  const map = readMap()
  const ts = map[key]
  return !!ts && Date.now() - ts < WINDOW_MS
}

// Запомнить отправленный номер.
export function markSubmitted(phone: string) {
  const key = phoneKey(phone)
  if (!key) return
  const map = readMap()
  map[key] = Date.now()
  writeMap(map)
}

export interface SubmitResult {
  ok: boolean
  duplicate: boolean
  // Сообщение для пользователя при ошибке или дубликате.
  message?: string
}

interface LeadData {
  name: string
  phone: string
  message?: string
  [key: string]: unknown
}

// Отправка заявки с полной обработкой ответа сервера.
export async function submitLead(data: LeadData): Promise<SubmitResult> {
  // 1. Локальная проверка — мгновенно отсекаем повторную отправку без запроса.
  if (wasRecentlySubmitted(data.phone)) {
    return {
      ok: true,
      duplicate: true,
      message: "Вы уже оставили заявку. Мы скоро вам перезвоним.",
    }
  }

  try {
    const response = await fetch("/api/send-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const result = await response.json().catch(() => ({}))

    // 2. Сервер сообщил, что это дубликат (по номеру за 24ч).
    if (result?.duplicate) {
      markSubmitted(data.phone)
      return {
        ok: true,
        duplicate: true,
        message: result.message || "Вы уже оставили заявку. Мы скоро вам перезвоним.",
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        duplicate: false,
        message: result?.error || "Не удалось отправить заявку. Попробуйте позже.",
      }
    }

    // 3. Успех — запоминаем номер.
    markSubmitted(data.phone)
    return { ok: true, duplicate: false }
  } catch {
    return {
      ok: false,
      duplicate: false,
      message: "Не удалось отправить заявку. Попробуйте позже или позвоните нам.",
    }
  }
}
