import { describe, it, expect } from 'vitest';
import { InMemoryTweetRepository } from '@infrastructure/InMemoryTweetRepository';
import { ViewTimelineUseCase } from './ViewTimelineUseCase';
import { aTweet } from '../../../tests/builders/tweetBuilder';

describe('ViewTimelineUseCase', () => {
  it('should return all tweets when no authorId is provided', async () => {
    // Arrange
    const tweetRepository = new InMemoryTweetRepository();
    const useCase = new ViewTimelineUseCase(tweetRepository);

    await tweetRepository.save(aTweet().withContent('Tweet 1').withAuthorId('user-1').build());
    await tweetRepository.save(aTweet().withContent('Tweet 2').withAuthorId('user-2').build());
    await tweetRepository.save(aTweet().withContent('Tweet 3').withAuthorId('user-1').build());

    // Act
    const timeline = await useCase.execute();

    // Assert
    expect(timeline.length).toBe(3);
    expect(timeline[0]).toEqual(expect.objectContaining({ content: 'Tweet 1', authorId: 'user-1' }));
    expect(timeline[1]).toEqual(expect.objectContaining({ content: 'Tweet 2', authorId: 'user-2' }));
    expect(timeline[2]).toEqual(expect.objectContaining({ content: 'Tweet 3', authorId: 'user-1' }));
  });

  it('should return only tweets from a specific author when authorId is provided', async () => {
    // Arrange
    const tweetRepository = new InMemoryTweetRepository();
    const useCase = new ViewTimelineUseCase(tweetRepository);

    await tweetRepository.save(aTweet().withContent('Tweet 1').withAuthorId('user-1').build());
    await tweetRepository.save(aTweet().withContent('Tweet 2').withAuthorId('user-2').build());
    await tweetRepository.save(aTweet().withContent('Tweet 3').withAuthorId('user-1').build());

    // Act
    const timeline = await useCase.execute({ authorId: 'user-1' });

    // Assert
    expect(timeline.length).toBe(2);
    expect(timeline[0]).toEqual(expect.objectContaining({ content: 'Tweet 1', authorId: 'user-1' }));
    expect(timeline[1]).toEqual(expect.objectContaining({ content: 'Tweet 3', authorId: 'user-1' }));
    // Vérification que tous les tweets retournés appartiennent bien à user-1
    expect(timeline.every(t => t.authorId === 'user-1')).toBe(true);
  });

  it('should return an empty array if no tweets exist', async () => {
    // Arrange
    const tweetRepository = new InMemoryTweetRepository();
    const useCase = new ViewTimelineUseCase(tweetRepository);

    // Act
    const timeline = await useCase.execute();

    // Assert
    expect(timeline).toEqual([]);
  });
});
