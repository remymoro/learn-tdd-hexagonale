import { describe, it, expect } from 'vitest';
import { Tweet } from '@domain/tweet/Tweet';

describe('Tweet Entity', () => {
  it('should create a tweet when content is less than 280 characters', () => {
    // Arrange
    const content = 'Ceci est mon tout premier tweet !';
    const authorId = 'user-123';

    // Act
    const tweet = new Tweet(content, authorId);

    // Assert
    expect(tweet.content).toBe(content);
    expect(tweet.authorId).toBe(authorId);
  });

  it('should throw an error when content exceeds 280 characters', () => {
    // Arrange
    const longContent = 'a'.repeat(281);
    const authorId = 'user-123';

    // Act & Assert
    expect(() => new Tweet(longContent, authorId)).toThrowError(
      'A tweet cannot exceed 280 characters.'
    );
  });

  it('should throw an error when content is less than 1 character', () => {
    // Arrange
    const content = '';
    const authorId = 'user-123';

    // Act & Assert
    expect(() => new Tweet(content, authorId)).toThrowError(
      'A tweet must have at least one character.'
    );
  });

  it('should throw an error when authorId is null or undefined', () => {
    // Arrange
    const content = 'Ceci est mon tout premier tweet !';
    const authorId = null as unknown as string;

    // Act & Assert
    expect(() => new Tweet(content, authorId)).toThrowError(
      'Author ID is required.'
    );
  });

  it('should throw an error when authorId is empty string', () => {
    // Arrange
    const content = 'Ceci est mon tout premier tweet !';
    const authorId = '';

    // Act & Assert
    expect(() => new Tweet(content, authorId)).toThrowError(
      'Author ID is required.'
    );
  });

  // --- NOUVEAUX TESTS : VALUE OBJECT ---

  it('should create a tweet when content is exactly 280 characters (cas limite)', () => {
    // Arrange
    const exactContent = 'a'.repeat(280);
    const authorId = 'user-123';

    // Act
    const tweet = new Tweet(exactContent, authorId);

    // Assert
    expect(tweet.content).toBe(exactContent);
    expect(tweet.authorId).toBe(authorId);
  });

  it('should prevent modification of properties (immuabilité)', () => {
    const tweet = new Tweet('Mon tweet immuable', 'user-123');

    expect(() => {
      // @ts-expect-error
      tweet.content = 'Nouveau texte interdit';
    }).toThrow();

    expect(() => {
      // @ts-expect-error
      tweet.authorId = 'hacker-456';
    }).toThrow();
  });


  it('should return a new instance when content changes (immutability)', () => {
    // Arrange
    const originalTweet = new Tweet('Premier message', 'user-123');
    const newContent = 'Nouveau message mis à jour';

    // Act
    const updatedTweet = originalTweet.withContent(newContent);

    // Assert
    expect(updatedTweet).not.toBe(originalTweet); // Doit être une nouvelle instance
    expect(updatedTweet.content).toBe(newContent);
    expect(updatedTweet.authorId).toBe(originalTweet.authorId); // L'auteur reste le même
    expect(originalTweet.content).toBe('Premier message'); // L'original n'est pas modifié
  });

});





