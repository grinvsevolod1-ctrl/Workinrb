// Prisma клиент с lazy initialization
// Работает только когда DATABASE_URL настроен и prisma generate выполнен

let prismaInstance: ReturnType<typeof createPrismaClient> | null = null
let prismaAvailable = true

function createPrismaClient() {
  try {
    const { PrismaClient } = require('@prisma/client')
    return new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })
  } catch (e) {
    console.warn('[Prisma] Client not available. Run `npx prisma generate` to enable database.')
    prismaAvailable = false
    return null
  }
}

export function getPrisma() {
  if (!prismaAvailable) return null

  if (!process.env.DATABASE_URL) {
    return null
  }

  if (!prismaInstance) {
    const globalForPrisma = globalThis as unknown as {
      prisma: ReturnType<typeof createPrismaClient> | undefined
    }

    prismaInstance = globalForPrisma.prisma ?? createPrismaClient()

    if (prismaInstance && process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance
    }
  }

  return prismaInstance
}

export default { getPrisma }
