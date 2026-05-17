import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaFollowRepository } from './PrismaFollowRepository.js'
import { createTestDatabase } from '../tests/helpers/createTestDatabase.js'
import { Follow } from '@domain/user/Follow.js'
import { UserId } from '@domain/user/UserId.js'

describe('PrismaFollowRepository', () => {
  let container: StartedPostgreSqlContainer
  let prisma: PrismaClient
  let repository: PrismaFollowRepository

  beforeAll(async () => {
    const db = await createTestDatabase()
    container = db.container
    prisma = db.prisma
    repository = new PrismaFollowRepository(prisma)
  }, 60_000)

  afterAll(async () => {
    await prisma.$disconnect()
    await container.stop()
  })

  beforeEach(async () => {
    await prisma.follow.deleteMany()
  })

  it('sauvegarde une relation de follow', async () => {
    const follow = Follow.create(new UserId('alice'), new UserId('bob'))

    await repository.save(follow)

    const exists = await repository.exists(new UserId('alice'), new UserId('bob'))
    expect(exists).toBe(true)
  })

  it('retourne false si la relation n\'existe pas', async () => {
    const exists = await repository.exists(new UserId('alice'), new UserId('bob'))
    expect(exists).toBe(false)
  })

  it('retourne les ids des utilisateurs suivis', async () => {
    const alice = new UserId('alice')
    await repository.save(Follow.create(alice, new UserId('bob')))
    await repository.save(Follow.create(alice, new UserId('charlie')))

    const followed = await repository.findFollowedUserIds(alice)

    expect(followed).toHaveLength(2)
    expect(followed.map(u => u.value)).toEqual(expect.arrayContaining(['bob', 'charlie']))
  })

  it('retourne une liste vide si l\'utilisateur ne suit personne', async () => {
    const followed = await repository.findFollowedUserIds(new UserId('alice'))
    expect(followed).toHaveLength(0)
  })
})
