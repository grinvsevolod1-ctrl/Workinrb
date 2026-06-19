// Скрипт для создания первого администратора
// Запуск: npx tsx scripts/create-admin.ts

// @ts-ignore - PrismaClient доступен после prisma generate
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@workinrb.top'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Администратор'

  // Проверяем существует ли уже админ
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existingAdmin) {
    console.log('Администратор уже существует:', existingAdmin.email)
    return
  }

  // Хэшируем пароль
  const hashedPassword = await bcrypt.hash(password, 12)

  // Создаем админа
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log('Администратор создан успешно!')
  console.log('Email:', admin.email)
  console.log('Пароль:', password)
  console.log('')
  console.log('ВАЖНО: Смените пароль после первого входа!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
