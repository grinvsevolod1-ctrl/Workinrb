import { NextRequest } from 'next/server'

// Простой in-memory rate limiter (фиксированное окно).
// Работает в пределах одного инстанса. Для распределённого продакшена
// (несколько инстансов) стоит заменить на Upstash Redis, но даже так
// он эффективно гасит брутфорс и спам в рамках инстанса.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Периодическая очистка протухших записей, чтобы Map не рос бесконечно.
function cleanup(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * @param key уникальный идентификатор (например `login:<ip>`)
 * @param limit максимум запросов за окно
 * @param windowMs длительность окна в миллисекундах
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  cleanup(now)

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count += 1
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
}

// Достаём IP клиента из заголовков прокси (Vercel прокидывает x-forwarded-for).
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}
