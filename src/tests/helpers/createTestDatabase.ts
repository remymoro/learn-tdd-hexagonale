import { execSync } from 'child_process'
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../generated/prisma/client.js'

export interface TestDatabase {
  container: StartedPostgreSqlContainer
  prisma: PrismaClient
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:16-alpine').start()
  const connectionString = container.getConnectionUri()

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: connectionString },
    stdio: 'pipe',
  })

  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  return { container, prisma }
}
