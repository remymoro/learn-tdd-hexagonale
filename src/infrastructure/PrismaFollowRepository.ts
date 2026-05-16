import { Follow } from '@domain/user/Follow.js'
import { UserId } from '@domain/user/UserId.js'
import { FollowRepository } from '@application/ports/FollowRepository.js'
import { prisma as defaultPrisma } from './prismaClient.js'

type PrismaClientInstance = typeof defaultPrisma

export class PrismaFollowRepository implements FollowRepository {
  constructor(private readonly prisma: PrismaClientInstance = defaultPrisma) { }

  async save(follow: Follow): Promise<void> {
    await this.prisma.follow.create({
      data: {
        followerId: follow.followerId,
        followedId: follow.followedId,
      },
    })
  }

  async exists(followerId: UserId, followedId: UserId): Promise<boolean> {
    const row = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: followerId.value,
          followedId: followedId.value,
        },
      },
    })

    return row !== null
  }

  async findFollowedUserIds(followerId: UserId): Promise<UserId[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followerId: followerId.value },
    })

    return rows.map((row: { followedId: string }) => new UserId(row.followedId));
  }
}
