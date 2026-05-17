import { describe, it, expect } from 'vitest';
import { InMemoryTweetRepository } from '@tests/InMemoryTweetRepository';
import { PublishTweetUseCase } from './PublishTweetUseCase';

describe('PublishTweetUseCase', () => {
  it('should publish a valid tweet', async () => {
    // Arrange
    const tweetRepository = new InMemoryTweetRepository();
    const useCase = new PublishTweetUseCase(tweetRepository);

    const command = {
      message: 'Ceci est mon premier tweet via UseCase !',
      authorId: 'user-123'
    };

    // Act
    await useCase.execute(command);

    // Assert
    expect(tweetRepository.tweets.length).toBe(1);
    expect(tweetRepository.tweets[0]).toHaveProperty('content', command.message);
    expect(tweetRepository.tweets[0]).toHaveProperty('authorId', command.authorId);

  });
});
