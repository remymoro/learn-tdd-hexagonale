import { Tweet } from '@domain/tweet/Tweet'
import { TweetId } from '@domain/tweet/TweetId'
import { Message } from '@domain/tweet/Message'
import { AuthorId } from '@domain/tweet/AuthorId'
import { TweetRepository } from '@application/ports/TweetRepository'
import { prisma as defaultPrisma } from './prismaClient.js'

type PrismaClientInstance = typeof defaultPrisma

export class PrismaTweetRepository implements TweetRepository {
  constructor(private readonly prisma: PrismaClientInstance = defaultPrisma) {}

  async save(tweet: Tweet): Promise<void> {
    await this.prisma.tweet.create({
      data: {
        id: tweet.id,
        content: tweet.content,
        authorId: tweet.authorId,
      },
    })
  }

  async update(tweet: Tweet): Promise<void> {
    await this.prisma.tweet.update({
      where: { id: tweet.id },
      data: {
        content: tweet.content,
        authorId: tweet.authorId,
        deletedAt: tweet.deletedAt,
      },
    })
  }

  async findById(id: string): Promise<Tweet | null> {
    const row = await this.prisma.tweet.findUnique({ where: { id } })
    if (!row) return null

    return Tweet.reconstitute(
      new TweetId(row.id),
      new Message(row.content),
      new AuthorId(row.authorId),
      row.deletedAt,
    )
  }

  async findPublishedTweetsByAuthor(authorId: string): Promise<Tweet[]> {
    const rows = await this.prisma.tweet.findMany({
      where: { authorId, deletedAt: null },
    })
    return rows.map(row => Tweet.reconstitute(
      new TweetId(row.id),
      new Message(row.content),
      new AuthorId(row.authorId),
    ))
  }

  async findPublishedTweetsByAuthors(authorIds: string[]): Promise<Tweet[]> {
    const rows = await this.prisma.tweet.findMany({
      where: { authorId: { in: authorIds }, deletedAt: null },
    })
    return rows.map(row => Tweet.reconstitute(
      new TweetId(row.id),
      new Message(row.content),
      new AuthorId(row.authorId),
    ))
  }

  async getAllTweets(): Promise<Tweet[]> {
    const rows = await this.prisma.tweet.findMany({
      where: { deletedAt: null },
    })
    return rows.map(row => Tweet.reconstitute(
      new TweetId(row.id),
      new Message(row.content),
      new AuthorId(row.authorId),
    ))
  }
}
