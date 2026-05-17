import { describe, it, expect } from 'vitest'
import { InMemoryTweetRepository } from '@tests/InMemoryTweetRepository'
import { PublishTweetUseCase } from './PublishTweetUseCase'

describe('PublishTweetUseCase', () => {
  it('publie un tweet valide et retourne le résultat', async () => {
    const tweetRepository = new InMemoryTweetRepository()
    const useCase = new PublishTweetUseCase(tweetRepository)
    const command = { message: 'Mon premier tweet via UseCase !', authorId: 'user-123' }

    const result = await useCase.execute(command)

    expect(result.id).toBeDefined()
    expect(result.content).toBe(command.message)
    expect(result.authorId).toBe(command.authorId)
    expect(tweetRepository.tweets).toHaveLength(1)
  })

  it('rejette un message vide', async () => {
    const useCase = new PublishTweetUseCase(new InMemoryTweetRepository())

    await expect(useCase.execute({ message: '', authorId: 'user-123' }))
      .rejects.toThrowError('A tweet must have at least one character.')
  })

  it('rejette un message de plus de 280 caractères', async () => {
    const useCase = new PublishTweetUseCase(new InMemoryTweetRepository())

    await expect(useCase.execute({ message: 'a'.repeat(281), authorId: 'user-123' }))
      .rejects.toThrowError('A tweet cannot exceed 280 characters.')
  })
})
