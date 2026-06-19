import { parsePhoneNumberFromString } from 'libphonenumber-js'

// Страны СНГ, с которых реально приходят заявки.
// Если номер без кода страны, пробуем как белорусский/российский.
const DEFAULT_COUNTRIES = ['BY', 'RU', 'UA', 'KZ', 'UZ', 'MD', 'AZ', 'AM', 'GE', 'KG', 'TJ', 'TM'] as const

export interface PhoneValidationResult {
  valid: boolean
  // Нормализованный номер в формате E.164 (например, +375291234567) — для дедупа.
  normalized: string | null
  // Красивый формат для отображения.
  formatted: string | null
  country: string | null
}

// Проверяет и нормализует телефон на сервере.
// Возвращает E.164 для надёжного сравнения дубликатов.
export function validateAndNormalizePhone(raw: string): PhoneValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, normalized: null, formatted: null, country: null }
  }

  const trimmed = raw.trim()

  // Сначала пробуем распарсить как есть (если есть код страны вида +375...).
  let parsed = parsePhoneNumberFromString(trimmed)

  // Если не вышло — пробуем подобрать страну по умолчанию.
  if (!parsed || !parsed.isValid()) {
    for (const country of DEFAULT_COUNTRIES) {
      const attempt = parsePhoneNumberFromString(trimmed, country)
      if (attempt && attempt.isValid()) {
        parsed = attempt
        break
      }
    }
  }

  if (!parsed || !parsed.isValid()) {
    return { valid: false, normalized: null, formatted: null, country: null }
  }

  return {
    valid: true,
    normalized: parsed.number, // E.164, например +375291234567
    formatted: parsed.formatInternational(),
    country: parsed.country || null,
  }
}

// Только цифры — запасной ключ дедупа, если нормализация не удалась.
export function phoneDigits(raw: string): string {
  return (raw || '').replace(/\D/g, '')
}
