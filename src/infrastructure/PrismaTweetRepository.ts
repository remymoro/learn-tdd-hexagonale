import { Tweet } from '@domain/tweet/Tweet.js'
import { TweetId } from '@domain/tweet/TweetId.js'
import { Message } from '@domain/tweet/Message.js'
import { AuthorId } from '@domain/tweet/AuthorId.js'
import { TweetRepository } from '@application/ports/TweetRepository.js'
import { prisma as defaultPrisma } from './prismaClient.js'

type PrismaClientInstance = typeof defaultPrisma

export class PrismaTweetRepository implements TweetRepository {
  constructor(private readonly prisma: PrismaClientInstance = defaultPrisma) { }

  async save(tweet: Tweet): Promise<void> {
    await this.prisma.tweet.create({
      data: {
        id: tweet.getTweetId(),
        content: tweet.getMessage(),
        authorId: tweet.getAuthorId(),
      },
    })
  }

  async update(tweet: Tweet): Promise<void> {
    await this.prisma.tweet.update({
      where: { id: tweet.getTweetId() },
      data: {
        content: tweet.getMessage(),
        authorId: tweet.getAuthorId(),
        deletedAt: tweet.getDeletedAt(),
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
      row.deletedAt
    )
  }

  async findPublishedTweetsByAuthor(authorId: string): Promise<Tweet[]> {
    const rows = await this.prisma.tweet.findMany({
      where: { authorId, deletedAt: null },
    })
    return rows.map(row => Tweet.reconstitute(
      new TweetId(row.id),
      new Message(row.content),
      new AuthorId(row.authorId)
    ))
  }

  async findPublishedTweetsByAuthors(authorIds: string[]): Promise<Tweet[]> {
    const rows = await this.prisma.tweet.findMany({
      where: { authorId: { in: authorIds }, deletedAt: null },
    })
    return rows.map(row => Tweet.reconstitute(
      new TweetId(row.id),
      new Message(row.content),
      new AuthorId(row.authorId)
    ))
  }

  async getAllTweets(): Promise<Tweet[]> {
    const rows = await this.prisma.tweet.findMany({
      where: { deletedAt: null },
    })
    return rows.map(row => Tweet.reconstitute(
      new TweetId(row.id),
      new Message(row.content),
      new AuthorId(row.authorId)
    ))
  }
}
