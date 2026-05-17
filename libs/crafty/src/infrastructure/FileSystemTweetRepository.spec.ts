import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { promises as fs } from 'fs'
import * as path from 'path'
import { FileSystemTweetRepository } from './FileSystemTweetRepository'
import { Tweet } from '@domain/tweet/Tweet'
import { Message } from '@domain/tweet/Message'
import { AuthorId } from '@domain/tweet/AuthorId'

const UNKNOWN_TWEET_ID = '880e8400-e29b-41d4-a716-446655440000'

describe('FileSystemTweetRepository', () => {
  const testFilePath = path.join(process.cwd(), 'data', 'test-tweets.json')
  let repository: FileSystemTweetRepository

  beforeEach(async () => {
    try {
      await fs.unlink(testFilePath)
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error
    }
    repository = new FileSystemTweetRepository(testFilePath)
  })

  afterAll(async () => {
    try {
      await fs.unlink(testFilePath)
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error
    }
  })

  it('sauvegarde un tweet dans le système de fichiers', async () => {
    const tweet = Tweet.create(new Message('Mon tweet FS'), new AuthorId('user-fs'))

    await repository.save(tweet)

    const saved = await repository.getAllTweets()
    expect(saved).toHaveLength(1)
    expect(saved[0]?.id).toBe(tweet.id)
    expect(saved[0]?.content).toBe(tweet.content)
    expect(saved[0]?.authorId).toBe(tweet.authorId)
  })

  it('ajoute plusieurs tweets sans écraser les précédents', async () => {
    const tweet1 = Tweet.create(new Message('Premier tweet'), new AuthorId('user-1'))
    const tweet2 = Tweet.create(new Message('Deuxième tweet'), new AuthorId('user-2'))

    await repository.save(tweet1)
    await repository.save(tweet2)

    const saved = await repository.getAllTweets()
    expect(saved).toHaveLength(2)
    expect(saved[0]?.id).toBe(tweet1.id)
    expect(saved[1]?.id).toBe(tweet2.id)
  })

  it('retourne un tableau vide si le fichier n\'existe pas', async () => {
    const saved = await repository.getAllTweets()
    expect(saved).toEqual([])
  })

  it('persiste les données dans le bon format JSON', async () => {
    const tweet = Tweet.create(new Message('Tweet avec id persistant'), new AuthorId('user-1'))

    await repository.save(tweet)

    const fileContent = await fs.readFile(testFilePath, 'utf-8')
    const parsed = JSON.parse(fileContent)
    expect(parsed).toEqual([{
      id: tweet.id,
      content: tweet.content,
      authorId: tweet.authorId,
      deletedAt: null,
    }])
  })

  it('retrouve un tweet par son id', async () => {
    const tweet1 = Tweet.create(new Message('Premier tweet'), new AuthorId('user-1'))
    const tweet2 = Tweet.create(new Message('Deuxième tweet'), new AuthorId('user-2'))
    await repository.save(tweet1)
    await repository.save(tweet2)

    const found = await repository.findById(tweet2.id)

    expect(found).not.toBeNull()
    expect(found?.id).toBe(tweet2.id)
    expect(found?.content).toBe(tweet2.content)
    expect(found?.authorId).toBe(tweet2.authorId)
  })

  it('retourne null si le tweet n\'existe pas', async () => {
    const tweet = Tweet.create(new Message('Tweet existant'), new AuthorId('user-1'))
    await repository.save(tweet)

    const found = await repository.findById(UNKNOWN_TWEET_ID)
    expect(found).toBeNull()
  })

  it('met à jour un tweet sans en ajouter un nouveau', async () => {
    const tweet = Tweet.create(new Message('Ancien message'), new AuthorId('user-1'))
    await repository.save(tweet)

    await repository.update(tweet.withContent(new Message('Nouveau message')))

    const saved = await repository.getAllTweets()
    expect(saved).toHaveLength(1)
    expect(saved[0]?.id).toBe(tweet.id)
    expect(saved[0]?.content).toBe('Nouveau message')
  })

  it('ignore la mise à jour d\'un tweet inconnu', async () => {
    const tweet = Tweet.create(new Message('Tweet existant'), new AuthorId('user-1'))
    const unknown = Tweet.create(new Message('Tweet inconnu'), new AuthorId('user-1'))
    await repository.save(tweet)

    await repository.update(unknown)

    const saved = await repository.getAllTweets()
    expect(saved).toHaveLength(1)
    expect(saved[0]?.id).toBe(tweet.id)
  })

  it('exclut les tweets soft-deleted de getAllTweets', async () => {
    const tweet1 = Tweet.create(new Message('Premier tweet'), new AuthorId('user-1'))
    const tweet2 = Tweet.create(new Message('Deuxième tweet'), new AuthorId('user-2'))
    await repository.save(tweet1)
    await repository.save(tweet2)

    await repository.update(tweet1.markAsDeleted(new Date()))

    const saved = await repository.getAllTweets()
    expect(saved).toHaveLength(1)
    expect(saved[0]?.id).toBe(tweet2.id)
  })

  it('retrouve un tweet soft-deleted via findById', async () => {
    const tweet = Tweet.create(new Message('Tweet supprimé'), new AuthorId('user-1'))
    await repository.save(tweet)

    await repository.update(tweet.markAsDeleted(new Date()))

    const found = await repository.findById(tweet.id)
    expect(found?.isDeleted).toBe(true)
  })
})
