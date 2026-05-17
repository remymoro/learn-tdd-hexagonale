import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaTweetRepository } from './PrismaTweetRepository.js'
import { createTestDatabase } from '../tests/helpers/createTestDatabase.js'
import { Message } from '../domain/tweet/Message.js'
import { aTweet } from '../tests/builders/tweetBuilder.js'

describe('PrismaTweetRepository', () => {
  let container: StartedPostgreSqlContainer
  let prisma: PrismaClient
  let repository: PrismaTweetRepository

  beforeAll(async () => {
    const db = await createTestDatabase()
    container = db.container
    prisma = db.prisma
    repository = new PrismaTweetRepository(prisma)
  }, 60_000)

  afterAll(async () => {
    await prisma.$disconnect()
    await container.stop()
  })

  beforeEach(async () => {
    await prisma.tweet.deleteMany()
  })

  it('sauvegarde un tweet et le retrouve par id', async () => {
    const tweet = aTweet().withAuthorId('alice').build()

    await repository.save(tweet)

    const found = await repository.findById(tweet.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(tweet.id)
    expect(found!.content).toBe(tweet.content)
    expect(found!.authorId).toBe(tweet.authorId)
  })

  it('retourne null si le tweet n\'existe pas', async () => {
    const found = await repository.findById('id-inexistant')
    expect(found).toBeNull()
  })

  it('met à jour le contenu d\'un tweet', async () => {
    const tweet = aTweet().withAuthorId('alice').build()
    await repository.save(tweet)

    await repository.update(tweet.withContent(new Message('Contenu mis à jour')))

    const found = await repository.findById(tweet.id)
    expect(found!.content).toBe('Contenu mis à jour')
  })

  it('retourne tous les tweets', async () => {
    const tweet1 = aTweet().withAuthorId('alice').build()
    const tweet2 = aTweet().withAuthorId('bob').build()
    await repository.save(tweet1)
    await repository.save(tweet2)

    const all = await repository.getAllTweets()
    expect(all).toHaveLength(2)
  })

  it('retourne une liste vide si aucun tweet', async () => {
    const all = await repository.getAllTweets()
    expect(all).toHaveLength(0)
  })
})
