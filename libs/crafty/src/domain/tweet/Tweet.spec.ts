import { describe, it, expect } from 'vitest'
import { Tweet } from '@domain/tweet/Tweet'
import { Message } from '@domain/tweet/Message'
import { AuthorId } from '@domain/tweet/AuthorId'
import { TweetId } from '@domain/tweet/TweetId'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('Tweet', () => {
  describe('create', () => {
    it('crée un tweet avec un contenu valide', () => {
      const tweet = Tweet.create(new Message('Mon premier tweet'), new AuthorId('user-123'))

      expect(tweet.content).toBe('Mon premier tweet')
      expect(tweet.authorId).toBe('user-123')
      expect(tweet.id).toBeDefined()
      expect(tweet.isDeleted).toBe(false)
      expect(tweet.deletedAt).toBeNull()
    })

    it('génère un id unique à chaque création', () => {
      const tweet1 = Tweet.create(new Message('Tweet 1'), new AuthorId('user-123'))
      const tweet2 = Tweet.create(new Message('Tweet 2'), new AuthorId('user-123'))

      expect(tweet1.id).not.toBe(tweet2.id)
    })

    it('délègue la validation du contenu au Value Object Message', () => {
      expect(() => Tweet.create(new Message('a'.repeat(281)), new AuthorId('user-123')))
        .toThrowError('A tweet cannot exceed 280 characters.')

      expect(() => Tweet.create(new Message(''), new AuthorId('user-123')))
        .toThrowError('A tweet must have at least one character.')
    })

    it('délègue la validation de l\'auteur au Value Object AuthorId', () => {
      expect(() => Tweet.create(new Message('Mon tweet'), new AuthorId('')))
        .toThrowError('Author ID is required.')

      expect(() => Tweet.create(new Message('Mon tweet'), new AuthorId(null as unknown as string)))
        .toThrowError('Author ID is required.')
    })
  })

  describe('reconstitute', () => {
    it('reconstruit un tweet depuis la persistance avec son id existant', () => {
      const tweetId = new TweetId(VALID_UUID)
      const tweet = Tweet.reconstitute(tweetId, new Message('Tweet persisté'), new AuthorId('user-123'))

      expect(tweet.id).toBe(VALID_UUID)
      expect(tweet.content).toBe('Tweet persisté')
      expect(tweet.authorId).toBe('user-123')
      expect(tweet.isDeleted).toBe(false)
    })

    it('reconstruit un tweet supprimé avec sa date de suppression', () => {
      const deletedAt = new Date('2024-01-01T00:00:00.000Z')
      const tweet = Tweet.reconstitute(
        new TweetId(VALID_UUID),
        new Message('Tweet supprimé'),
        new AuthorId('user-123'),
        deletedAt,
      )

      expect(tweet.isDeleted).toBe(true)
      expect(tweet.deletedAt).toEqual(deletedAt)
    })
  })

  describe('withContent', () => {
    it('retourne une nouvelle instance avec le nouveau contenu', () => {
      const original = Tweet.create(new Message('Premier message'), new AuthorId('user-123'))

      const updated = original.withContent(new Message('Nouveau message'))

      expect(updated.content).toBe('Nouveau message')
      expect(updated.id).toBe(original.id)
      expect(updated.authorId).toBe(original.authorId)
      expect(updated).not.toBe(original)
    })

    it('ne modifie pas l\'instance originale (immutabilité)', () => {
      const original = Tweet.create(new Message('Premier message'), new AuthorId('user-123'))

      original.withContent(new Message('Nouveau message'))

      expect(original.content).toBe('Premier message')
    })
  })

  describe('markAsDeleted', () => {
    it('retourne une nouvelle instance marquée comme supprimée', () => {
      const tweet = Tweet.create(new Message('Mon tweet'), new AuthorId('user-123'))
      const deletedAt = new Date('2024-06-01T12:00:00.000Z')

      const deleted = tweet.markAsDeleted(deletedAt)

      expect(deleted.isDeleted).toBe(true)
      expect(deleted.deletedAt).toEqual(deletedAt)
      expect(deleted.id).toBe(tweet.id)
    })

    it('ne modifie pas l\'instance originale (immutabilité)', () => {
      const tweet = Tweet.create(new Message('Mon tweet'), new AuthorId('user-123'))

      tweet.markAsDeleted(new Date())

      expect(tweet.isDeleted).toBe(false)
    })
  })

  describe('immutabilité', () => {
    it('interdit la modification directe des propriétés', () => {
      const tweet = Tweet.create(new Message('Tweet immuable'), new AuthorId('user-123'))

      expect(() => {
        // @ts-expect-error
        tweet.content = 'Interdit'
      }).toThrow()

      expect(() => {
        // @ts-expect-error
        tweet.authorId = 'hacker'
      }).toThrow()
    })
  })

  describe('equals', () => {
    it('deux tweets avec le même id sont égaux', () => {
      const tweetId = new TweetId(VALID_UUID)
      const tweet1 = Tweet.reconstitute(tweetId, new Message('A'), new AuthorId('user-1'))
      const tweet2 = Tweet.reconstitute(tweetId, new Message('B'), new AuthorId('user-2'))

      expect(tweet1.equals(tweet2)).toBe(true)
    })

    it('deux tweets avec des ids différents ne sont pas égaux', () => {
      const tweet1 = Tweet.create(new Message('A'), new AuthorId('user-1'))
      const tweet2 = Tweet.create(new Message('A'), new AuthorId('user-1'))

      expect(tweet1.equals(tweet2)).toBe(false)
    })
  })
})
