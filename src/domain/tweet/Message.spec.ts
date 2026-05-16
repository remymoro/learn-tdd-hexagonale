import { describe, it, expect } from 'vitest'
import { Message } from '@domain/tweet/Message'

describe('Message', () => {
  it('should create a message when content has at least one character', () => {
    const message = new Message('Ceci est mon tout premier tweet !')

    expect(message.value).toBe('Ceci est mon tout premier tweet !')
  })

  it('should create a message when content is exactly 280 characters', () => {
    const content = 'a'.repeat(280)

    const message = new Message(content)

    expect(message.value).toBe(content)
  })

  it('should throw an error when content is empty', () => {
    expect(() => new Message('')).toThrowError(
      'A tweet must have at least one character.'
    )
  })

  it('should throw an error when content only contains spaces', () => {
    expect(() => new Message('   ')).toThrowError(
      'A tweet must have at least one character.'
    )
  })

  it('should throw an error when content exceeds 280 characters', () => {
    expect(() => new Message('a'.repeat(281))).toThrowError(
      'A tweet cannot exceed 280 characters.'
    )
  })

  it('should be equal to another message with the same value', () => {
    const message = new Message('Même tweet')
    const sameMessage = new Message('Même tweet')

    expect(message.equals(sameMessage)).toBe(true)
  })

  it('should not be equal to another message with a different value', () => {
    const message = new Message('Premier tweet')
    const otherMessage = new Message('Second tweet')

    expect(message.equals(otherMessage)).toBe(false)
  })

  it('should create a message from JSON', () => {
    const message = Message.fromJSON('Tweet persisté')

    expect(message.value).toBe('Tweet persisté')
  })

  it('should serialize message to JSON', () => {
    const message = new Message('Tweet sérialisé')

    expect(message.toJSON()).toBe('Tweet sérialisé')
  })
})
