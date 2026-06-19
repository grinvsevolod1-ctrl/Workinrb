import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const TOKEN_NAME = 'crm_token'

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'MANAGER'
  name: string
}

// Хэширование пароля
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Проверка пароля
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Создание JWT токена
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Верификация токена
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Получение текущего пользователя из cookies
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload) return null
  
  // Динамический импорт prisma чтобы не ломать сборку
  try {
    const { getPrisma } = await import('./prisma')
    const prisma = getPrisma()
    
    if (!prisma) return payload // В dev режиме без БД доверяем токену
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true }
    })
    
    if (!user || !user.isActive) return null
  } catch {
    // Если БД недоступна, доверяем токену
    return payload
  }
  
  return payload
}

// Проверка является ли пользователь админом
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

// Установка cookie с токеном
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: isProduction, // true в production, false в development
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
    path: '/',
  })
}

// Удаление cookie
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}
