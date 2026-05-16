import { describe, expect, it } from 'vitest'
import { Follow } from '@domain/user/Follow'
import { UserId } from '@domain/user/UserId'

describe('Follow', () => {
  it('should create a follow relationship between two users', () => {
    const follow = Follow.create(new UserId('user-1'), new UserId('user-2'))

    expect(follow.followerId).toBe('user-1')
    expect(follow.followedId).toBe('user-2')
  })

  it('should throw when follower and followed are the same user', () => {
    expect(() =>
      Follow.create(new UserId('user-1'), new UserId('user-1'))
    ).toThrow('A user cannot follow themselves.')
  })

  it('should be equal to the same follow relationship', () => {
    const follow = Follow.create(new UserId('user-1'), new UserId('user-2'))
    const sameFollow = Follow.create(new UserId('user-1'), new UserId('user-2'))

    expect(follow.equals(sameFollow)).toBe(true)
  })

  it('should serialize follow relationship to JSON', () => {
    const follow = Follow.create(new UserId('user-1'), new UserId('user-2'))

    expect(follow.toJSON()).toEqual({
      followerId: 'user-1',
      followedId: 'user-2',
    })
  })
})
