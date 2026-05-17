import { describe, expect, it } from 'vitest'
import { FollowUserUseCase } from '@application/user/FollowUserUseCase'
import { ViewWallUseCase } from './ViewWallUseCase'
import { InMemoryFollowRepository } from '@tests/InMemoryFollowRepository'
import { InMemoryTweetRepository } from '@tests/InMemoryTweetRepository'
import { aTweet } from '@tests/builders/tweetBuilder'

describe('ViewWallUseCase', () => {
  it('retourne les tweets des utilisateurs suivis', async () => {
    const tweetRepository = new InMemoryTweetRepository()
    const followRepository = new InMemoryFollowRepository()
    const followUserUseCase = new FollowUserUseCase(followRepository)
    const viewWallUseCase = new ViewWallUseCase(tweetRepository, followRepository)

    await followUserUseCase.execute({ followerId: 'user-1', followedId: 'user-2' })
    await followUserUseCase.execute({ followerId: 'user-1', followedId: 'user-3' })
    await tweetRepository.save(aTweet().withContent('Tweet user 2').withAuthorId('user-2').build())
    await tweetRepository.save(aTweet().withContent('Tweet user 3').withAuthorId('user-3').build())
    await tweetRepository.save(aTweet().withContent('Tweet user 4').withAuthorId('user-4').build())

    const wall = await viewWallUseCase.execute({ userId: 'user-1' })

    expect(wall).toHaveLength(2)
    expect(wall[0]).toEqual(expect.objectContaining({ content: 'Tweet user 2', authorId: 'user-2' }))
    expect(wall[1]).toEqual(expect.objectContaining({ content: 'Tweet user 3', authorId: 'user-3' }))
  })

  it('retourne un mur vide si l\'utilisateur ne suit personne', async () => {
    const tweetRepository = new InMemoryTweetRepository()
    const followRepository = new InMemoryFollowRepository()
    const viewWallUseCase = new ViewWallUseCase(tweetRepository, followRepository)

    await tweetRepository.save(aTweet().withContent('Tweet user 2').withAuthorId('user-2').build())

    const wall = await viewWallUseCase.execute({ userId: 'user-1' })

    expect(wall).toEqual([])
  })

  it('n\'inclut pas les tweets de l\'utilisateur lui-même', async () => {
    const tweetRepository = new InMemoryTweetRepository()
    const followRepository = new InMemoryFollowRepository()
    const followUserUseCase = new FollowUserUseCase(followRepository)
    const viewWallUseCase = new ViewWallUseCase(tweetRepository, followRepository)

    await followUserUseCase.execute({ followerId: 'user-1', followedId: 'user-2' })
    await tweetRepository.save(aTweet().withContent('Mon tweet').withAuthorId('user-1').build())
    await tweetRepository.save(aTweet().withContent('Tweet suivi').withAuthorId('user-2').build())

    const wall = await viewWallUseCase.execute({ userId: 'user-1' })

    expect(wall).toHaveLength(1)
    expect(wall[0]).toEqual(expect.objectContaining({ content: 'Tweet suivi', authorId: 'user-2' }))
  })

  it('rejette un userId vide', async () => {
    const viewWallUseCase = new ViewWallUseCase(new InMemoryTweetRepository(), new InMemoryFollowRepository())

    await expect(viewWallUseCase.execute({ userId: '' })).rejects.toThrow('User ID is required.')
  })
})
