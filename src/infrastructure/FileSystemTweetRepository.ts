import { promises as fs } from 'fs';
import * as path from 'path';
import { Tweet } from '@domain/tweet/Tweet';
import { TweetRepository } from '@application/ports/TweetRepository';
import { AuthorId } from '@domain/tweet/AuthorId';
import { Message } from '@domain/tweet/Message';
import { TweetId } from '@domain/tweet/TweetId';

export class FileSystemTweetRepository implements TweetRepository {
  constructor(private readonly filePath: string = path.join(process.cwd(), 'data', 'tweets.json')) { }

  async save(tweet: Tweet): Promise<void> {
    const tweets = await this.getAllTweets();
    tweets.push(tweet);

    await this.writeTweets(tweets);
  }

  // Méthode utilitaire pour lire le fichier (interne ou utilisée pour les tests)
  async getAllTweets(): Promise<Tweet[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsedData = JSON.parse(data);

      // On re-transforme les données brutes en instances de l'entité Tweet
      return parsedData.map((item: any) =>
        Tweet.reconstitute(
          TweetId.fromJSON(item.id),
          Message.fromJSON(item.content),
          AuthorId.fromJSON(item.authorId)
        )
      );
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Le fichier n'existe pas encore, on retourne un tableau vide
        return [];
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Tweet | null> {
    const tweets = await this.getAllTweets();
    return tweets.find(t => t.id === id) || null;
  }

  async update(tweet: Tweet): Promise<void> {
    const tweets = await this.getAllTweets();
    const index = tweets.findIndex(t => t.id === tweet.id);
    if (index !== -1) {
      tweets[index] = tweet;
      await this.writeTweets(tweets);
    }
  }

  async deleteById(id: string): Promise<void> {
    const tweets = await this.getAllTweets();
    const filteredTweets = tweets.filter(t => t.id !== id);
    await this.writeTweets(filteredTweets);
  }

  private async writeTweets(tweets: Tweet[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(tweets, null, 2), 'utf-8');
  }

}
