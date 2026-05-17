import { promises as fs } from 'fs'
import * as path from 'path'
import { Tweet } from '@domain/tweet/Tweet'
import { TweetRepository } from '@application/ports/TweetRepository'
import { AuthorId } from '@domain/tweet/AuthorId'
import { Message } from '@domain/tweet/Message'
import { TweetId } from '@domain/tweet/TweetId'

export class FileSystemTweetRepository implements TweetRepository {
  constructor(private readonly filePath: string = path.join(process.cwd(), 'data', 'tweets.json')) {}

  async save(tweet: Tweet): Promise<void> {
    const all = await this.readAll()
    all.push(tweet)
    await this.writeAll(all)
  }

  async update(tweet: Tweet): Promise<void> {
    const all = await this.readAll()
    const index = all.findIndex(t => t.id === tweet.id)
    if (index !== -1) {
      all[index] = tweet
      await this.writeAll(all)
    }
  }

  async findById(id: string): Promise<Tweet | null> {
    const all = await this.readAll()
    return all.find(t => t.id === id) ?? null
  }

  async findPublishedTweetsByAuthor(authorId: string): Promise<Tweet[]> {
    const published = await this.getAllTweets()
    return published.filter(t => t.authorId === authorId)
  }

  async findPublishedTweetsByAuthors(authorIds: string[]): Promise<Tweet[]> {
    const published = await this.getAllTweets()
    return published.filter(t => authorIds.includes(t.authorId))
  }

  async getAllTweets(): Promise<Tweet[]> {
    const all = await this.readAll()
    return all.filter(t => !t.isDeleted)
  }

  private async readAll(): Promise<Tweet[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      const rows = JSON.parse(data) as { id: string; content: string; authorId: string; deletedAt: string | null }[]

      return rows.map(row => Tweet.reconstitute(
        new TweetId(row.id),
        new Message(row.content),
        new AuthorId(row.authorId),
        row.deletedAt ? new Date(row.deletedAt) : null,
      ))
    } catch (error: any) {
      if (error.code === 'ENOENT') return []
      throw error
    }
  }

  private async writeAll(tweets: Tweet[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    const data = tweets.map(t => ({
      id: t.id,
      content: t.content,
      authorId: t.authorId,
      deletedAt: t.deletedAt?.toISOString() ?? null,
    }))
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
  }
}
