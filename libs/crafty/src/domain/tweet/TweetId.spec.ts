import { describe, it, expect } from 'vitest'
import { TweetId } from '@domain/tweet/TweetId'

// Une constante réutilisable pour les tests
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const ANOTHER_UUID = '660e8400-e29b-41d4-a716-446655440000'

describe('TweetId', () => {

    it('should create a valid TweetId with a UUID', () => {
        const tweetId = new TweetId(VALID_UUID)
        expect(tweetId.value).toBe(VALID_UUID)
    })

    it('should generate a valid TweetId with crypto randomUUID', () => {
        const tweetId = TweetId.generate()

        expect(tweetId.value).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        )
    })

    it('should generate a different TweetId each time', () => {
        const tweetId1 = TweetId.generate()
        const tweetId2 = TweetId.generate()

        expect(tweetId1.equals(tweetId2)).toBe(false)
    })

    it('should throw when value is empty', () => {
        expect(() => new TweetId('')).toThrow('TweetId must be a valid UUID')
    })

    it('should throw when value is not a valid UUID', () => {
        expect(() => new TweetId('invalid-uuid')).toThrow('TweetId must be a valid UUID')
    })

    it('should be equal to another TweetId with the same value', () => {
        const tweetId1 = new TweetId(VALID_UUID)
        const tweetId2 = new TweetId(VALID_UUID)
        expect(tweetId1).toEqual(tweetId2)
    })

    it('should not be equal to another TweetId with a different value', () => {
        const tweetId1 = new TweetId(VALID_UUID)
        const tweetId2 = new TweetId(ANOTHER_UUID)
        expect(tweetId1).not.toEqual(tweetId2)
    })

    it('should create a TweetId from JSON', () => {
        const tweetId = TweetId.fromJSON(VALID_UUID)

        expect(tweetId.value).toBe(VALID_UUID)
    })

    it('should serialize TweetId to JSON', () => {
        const tweetId = new TweetId(VALID_UUID)

        expect(tweetId.toJSON()).toBe(VALID_UUID)
    })

})
