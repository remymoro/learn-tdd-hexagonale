import { describe, expect, it } from 'vitest'
import { AuthorId } from '@domain/tweet/AuthorId'

describe('AuthorId', () => {
  it('should create an author id when value is provided', () => {
    const authorId = new AuthorId('user-123')

    expect(authorId.value).toBe('user-123')
  })

  it('should throw when value is empty', () => {
    expect(() => new AuthorId('')).toThrow('Author ID is required.')
  })

  it('should throw when value only contains spaces', () => {
    expect(() => new AuthorId('   ')).toThrow('Author ID is required.')
  })

  it('should throw when value is null or undefined', () => {
    expect(() => new AuthorId(null as unknown as string)).toThrow(
      'Author ID is required.'
    )
  })

  it('should be equal to another AuthorId with the same value', () => {
    const authorId = new AuthorId('user-123')
    const sameAuthorId = new AuthorId('user-123')

    expect(authorId.equals(sameAuthorId)).toBe(true)
  })

  it('should not be equal to another AuthorId with a different value', () => {
    const authorId = new AuthorId('user-123')
    const otherAuthorId = new AuthorId('user-456')

    expect(authorId.equals(otherAuthorId)).toBe(false)
  })

  it('should create an author id from JSON', () => {
    const authorId = AuthorId.fromJSON('user-123')

    expect(authorId.value).toBe('user-123')
  })

  it('should serialize author id to JSON', () => {
    const authorId = new AuthorId('user-123')

    expect(authorId.toJSON()).toBe('user-123')
  })
})
