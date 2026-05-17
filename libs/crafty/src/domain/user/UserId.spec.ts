import { describe, expect, it } from 'vitest'
import { UserId } from '@domain/user/UserId'

describe('UserId', () => {
  it('should create a user id when value is provided', () => {
    const userId = new UserId('user-123')

    expect(userId.value).toBe('user-123')
  })

  it('should throw when value is empty', () => {
    expect(() => new UserId('')).toThrow('User ID is required.')
  })

  it('should throw when value only contains spaces', () => {
    expect(() => new UserId('   ')).toThrow('User ID is required.')
  })

  it('should be equal to another UserId with the same value', () => {
    const userId = new UserId('user-123')
    const sameUserId = new UserId('user-123')

    expect(userId.equals(sameUserId)).toBe(true)
  })

  it('should create a user id from JSON', () => {
    const userId = UserId.fromJSON('user-123')

    expect(userId.value).toBe('user-123')
  })

  it('should serialize user id to JSON', () => {
    const userId = new UserId('user-123')

    expect(userId.toJSON()).toBe('user-123')
  })
})
