// Pour installer : npm install hono @hono/node-server
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { PrismaTweetRepository } from '@infrastructure/PrismaTweetRepository'
import { PrismaFollowRepository } from '@infrastructure/PrismaFollowRepository'
import { PublishTweetUseCase } from '@application/tweet/publish/PublishTweetUseCase'
import { ViewTimelineUseCase } from '@application/tweet/timeline/ViewTimelineUseCase'
import { UpdateTweetUseCase } from '@application/tweet/update/UpdateTweetUseCase'
import { FollowUserUseCase } from '@application/user/FollowUserUseCase'
import { ViewWallUseCase } from '@application/tweet/wall/ViewWallUseCase'
import { TweetApiPresenter } from './presenters/TweetApiPresenter'
import { TweetAlreadyDeletedError, TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors'
import { UserAlreadyFollowsError } from '@domain/user/UserErrors'
import { DeleteTweetUseCase } from '@application/tweet/delete/DeleteTweetUseCase'
import { match } from '@shared/Result'

const tweetRepository = new PrismaTweetRepository()
const followRepository = new PrismaFollowRepository()

const publishTweetUseCase = new PublishTweetUseCase(tweetRepository)
const viewTimelineUseCase = new ViewTimelineUseCase(tweetRepository)
const updateTweetUseCase = new UpdateTweetUseCase(tweetRepository)
const deleteTweetUseCase = new DeleteTweetUseCase(tweetRepository)
const followUserUseCase = new FollowUserUseCase(followRepository)
const viewWallUseCase = new ViewWallUseCase(tweetRepository, followRepository)

const app = new Hono()

// ─── Tweets ──────────────────────────────────────────────────────────────────

app.post('/tweets', async (c) => {
  const { message, authorId } = await c.req.json<{ message: string; authorId: string }>()
  const tweet = await publishTweetUseCase.execute({ message, authorId })
  return c.json(TweetApiPresenter.toResponse(tweet), 201)
})

app.get('/tweets', async (c) => {
  const authorId = c.req.query('authorId')
  const tweets = await viewTimelineUseCase.execute({ authorId })
  return c.json(TweetApiPresenter.toListResponse(tweets))
})

app.put('/tweets/:id', async (c) => {
  const id = c.req.param('id')
  const { message, authorId } = await c.req.json<{ message: string; authorId: string }>()
  const result = await updateTweetUseCase.execute({ id, message, authorId })

  return match(result, {
    ok:  (): Response => c.body(null, 204),
    err: (error): Response => {
      if (error instanceof TweetNotFoundError) return c.json({ error: error.message }, 404)
      if (error instanceof UnauthorizedError)  return c.json({ error: error.message }, 403)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })
})

app.delete('/tweets/:id', async (c) => {
  const id = c.req.param('id')
  const { authorId } = await c.req.json<{ authorId: string }>()
  const result = await deleteTweetUseCase.execute({ id, authorId })

  return match(result, {
    ok:  (): Response => c.body(null, 204),
    err: (error): Response => {
      if (error instanceof TweetNotFoundError)       return c.json({ error: error.message }, 404)
      if (error instanceof TweetAlreadyDeletedError) return c.json({ error: error.message }, 410)
      if (error instanceof UnauthorizedError)        return c.json({ error: error.message }, 403)
      return c.json({ error: 'Internal server error' }, 500)
    }
  })
})

// ─── Follows ─────────────────────────────────────────────────────────────────

app.post('/follows', async (c) => {
  const { followerId, followedId } = await c.req.json<{ followerId: string; followedId: string }>()
  const result = await followUserUseCase.execute({ followerId, followedId })

  if (!result.success) {
    if (result.error instanceof UserAlreadyFollowsError) {
      return c.json({ error: result.error.message }, 409)
    }
  }

  return c.body(null, 201)
})

// ─── Wall ─────────────────────────────────────────────────────────────────────

app.get('/wall/:userId', async (c) => {
  const userId = c.req.param('userId')
  const tweets = await viewWallUseCase.execute({ userId })
  return c.json(TweetApiPresenter.toListResponse(tweets))
})

// ─── Erreurs globales ─────────────────────────────────────────────────────────

app.onError((error, c) => {
  return c.json({ error: error.message }, 400)
})

// ─── Démarrage (Node.js) ──────────────────────────────────────────────────────

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Server running on http://localhost:3000')
})
