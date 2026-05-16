import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { FileSystemTweetRepository } from './FileSystemTweetRepository';
import { Tweet } from '@domain/tweet/Tweet';
import { Message } from '@domain/tweet/Message';
import { AuthorId } from '@domain/tweet/AuthorId';
import { TweetId } from '@domain/tweet/TweetId';

const TWEET_ID_1 = '550e8400-e29b-41d4-a716-446655440000';
const TWEET_ID_2 = '660e8400-e29b-41d4-a716-446655440000';
const TWEET_ID_3 = '770e8400-e29b-41d4-a716-446655440000';
const UNKNOWN_TWEET_ID = '880e8400-e29b-41d4-a716-446655440000';

describe('FileSystemTweetRepository', () => {
  const testFilePath = path.join(process.cwd(), 'data', 'test-tweets.json');
  let repository: FileSystemTweetRepository;

  beforeEach(async () => {
    // Nettoyer le fichier de test avant chaque test
    try {
      await fs.unlink(testFilePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }

    repository = new FileSystemTweetRepository(testFilePath);
  });

  afterAll(async () => {
    // Nettoyage final
    try {
      await fs.unlink(testFilePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }
  });

  it('should save a tweet to the file system', async () => {
    // Arrange
    const tweet = Tweet.create(new Message('Mon tweet FS'), new AuthorId('user-fs'), new TweetId(TWEET_ID_1));

    // Act
    await repository.save(tweet);

    // Assert
    const savedTweets = await repository.getAllTweets();
    expect(savedTweets.length).toBe(1);
    expect(savedTweets[0]).toEqual(expect.objectContaining(tweet));
    expect(savedTweets[0]).toHaveProperty('id', tweet.id);
    expect(savedTweets[0]).toHaveProperty('content', tweet.content);
    expect(savedTweets[0]).toHaveProperty('authorId', tweet.authorId);
  });

  it('should append multiple tweets to the file system without overwriting', async () => {
    // Arrange
    const tweet1 = Tweet.create(new Message('Premier tweet'), new AuthorId('user-1'), new TweetId(TWEET_ID_1));
    const tweet2 = Tweet.create(new Message('Deuxième tweet'), new AuthorId('user-2'), new TweetId(TWEET_ID_2));

    // Act
    await repository.save(tweet1);
    await repository.save(tweet2);

    // Assert
    const savedTweets = await repository.getAllTweets();
    expect(savedTweets.length).toBe(2);
    expect(savedTweets[0]).toEqual(expect.objectContaining(tweet1));
    expect(savedTweets[1]).toEqual(expect.objectContaining(tweet2));
    expect(savedTweets[0]).toHaveProperty('id', tweet1.id);
    expect(savedTweets[0]).toHaveProperty('content', tweet1.content);
    expect(savedTweets[0]).toHaveProperty('authorId', tweet1.authorId);
    expect(savedTweets[1]).toHaveProperty('id', tweet2.id);
    expect(savedTweets[1]).toHaveProperty('content', tweet2.content);
    expect(savedTweets[1]).toHaveProperty('authorId', tweet2.authorId);
  });

  it('should return an empty array if the file does not exist', async () => {
    // Act
    const savedTweets = await repository.getAllTweets();

    // Assert
    expect(savedTweets).toEqual([]);
  });

  it('should persist tweet id in the JSON file', async () => {
    // Arrange
    const tweet = Tweet.create(new Message('Tweet avec id persistant'), new AuthorId('user-1'), new TweetId(TWEET_ID_1));

    // Act
    await repository.save(tweet);

    // Assert
    const fileContent = await fs.readFile(testFilePath, 'utf-8');
    const parsedTweets = JSON.parse(fileContent);

    expect(parsedTweets).toEqual([
      {
        id: tweet.id,
        content: tweet.content,
        authorId: tweet.authorId,
      },
    ]);
  });

  it('should find a tweet by its id', async () => {
    // Arrange
    const tweet1 = Tweet.create(new Message('Premier tweet'), new AuthorId('user-1'), new TweetId(TWEET_ID_1));
    const tweet2 = Tweet.create(new Message('Deuxième tweet'), new AuthorId('user-2'), new TweetId(TWEET_ID_2));
    await repository.save(tweet1);
    await repository.save(tweet2);

    // Act
    const foundTweet = await repository.findById(tweet2.id);

    // Assert
    expect(foundTweet).not.toBeNull();
    expect(foundTweet?.id).toBe(tweet2.id);
    expect(foundTweet?.content).toBe(tweet2.content);
    expect(foundTweet?.authorId).toBe(tweet2.authorId);
  });

  it('should return null when tweet id does not exist', async () => {
    // Arrange
    const tweet = Tweet.create(new Message('Tweet existant'), new AuthorId('user-1'), new TweetId(TWEET_ID_1));
    await repository.save(tweet);

    // Act
    const foundTweet = await repository.findById(UNKNOWN_TWEET_ID);

    // Assert
    expect(foundTweet).toBeNull();
  });

  it('should update an existing tweet without adding a new one', async () => {
    // Arrange
    const tweet = Tweet.create(new Message('Ancien message'), new AuthorId('user-1'), new TweetId(TWEET_ID_1));
    await repository.save(tweet);
    const updatedTweet = tweet.withContent(new Message('Nouveau message'));

    // Act
    await repository.update(updatedTweet);

    // Assert
    const savedTweets = await repository.getAllTweets();
    expect(savedTweets).toHaveLength(1);
    expect(savedTweets[0]?.id).toBe(tweet.id);
    expect(savedTweets[0]?.content).toBe('Nouveau message');
    expect(savedTweets[0]?.authorId).toBe(tweet.authorId);
  });

  it('should keep tweets unchanged when updating an unknown tweet', async () => {
    // Arrange
    const tweet = Tweet.create(new Message('Tweet existant'), new AuthorId('user-1'), new TweetId(TWEET_ID_1));
    const unknownTweet = Tweet.create(new Message('Tweet inconnu'), new AuthorId('user-1'), new TweetId(TWEET_ID_2));
    await repository.save(tweet);

    // Act
    await repository.update(unknownTweet);

    // Assert
    const savedTweets = await repository.getAllTweets();
    expect(savedTweets).toHaveLength(1);
    expect(savedTweets[0]?.id).toBe(tweet.id);
    expect(savedTweets[0]?.content).toBe(tweet.content);
  });

  it('should delete a tweet by its id', async () => {
    // Arrange
    const tweet1 = Tweet.create(new Message('Premier tweet'), new AuthorId('user-1'), new TweetId(TWEET_ID_1));
    const tweet2 = Tweet.create(new Message('Deuxième tweet'), new AuthorId('user-2'), new TweetId(TWEET_ID_2));
    await repository.save(tweet1);
    await repository.save(tweet2);

    // Act
    await repository.deleteById(tweet1.id);

    // Assert
    const savedTweets = await repository.getAllTweets();
    expect(savedTweets).toHaveLength(1);
    expect(savedTweets[0]?.id).toBe(tweet2.id);
  });

  it('should keep tweets unchanged when deleting an unknown tweet id', async () => {
    // Arrange
    const tweet = Tweet.create(new Message('Tweet existant'), new AuthorId('user-1'), new TweetId(TWEET_ID_1));
    await repository.save(tweet);

    // Act
    await repository.deleteById(UNKNOWN_TWEET_ID);

    // Assert
    const savedTweets = await repository.getAllTweets();
    expect(savedTweets).toHaveLength(1);
    expect(savedTweets[0]?.id).toBe(tweet.id);
  });
});
