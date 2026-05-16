import Fastify from 'fastify';
import { PrismaTweetRepository } from '@infrastructure/PrismaTweetRepository';
import { PrismaFollowRepository } from '@infrastructure/PrismaFollowRepository';
import { PublishTweetUseCase } from '@application/tweet/publish/PublishTweetUseCase';
import { ViewTimelineUseCase } from '@application/tweet/timeline/ViewTimelineUseCase';
import { UpdateTweetUseCase } from '@application/tweet/update/UpdateTweetUseCase';
import { FollowUserUseCase } from '@application/user/FollowUserUseCase';
import { ViewWallUseCase } from '@application/tweet/wall/ViewWallUseCase';
import { TweetApiPresenter } from './presenters/TweetApiPresenter';
import { TweetAlreadyDeletedError, TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors';
import { UserAlreadyFollowsError } from '@domain/user/UserErrors';
import { DeleteTweetUseCase } from '@application/tweet/delete/DeleteTweetUseCase';

const tweetRepository = new PrismaTweetRepository();
const followRepository = new PrismaFollowRepository();

const publishTweetUseCase = new PublishTweetUseCase(tweetRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(tweetRepository);
const updateTweetUseCase = new UpdateTweetUseCase(tweetRepository);
const deleteTweetUseCase = new DeleteTweetUseCase(tweetRepository);
const followUserUseCase = new FollowUserUseCase(followRepository);
const viewWallUseCase = new ViewWallUseCase(tweetRepository, followRepository);

const app = Fastify({ logger: true });

app.post('/tweets', async (request, reply) => {
  const { message, authorId } = request.body as { message: string; authorId: string };
  const tweet = await publishTweetUseCase.execute({ message, authorId });
  reply.status(201).send(TweetApiPresenter.toResponse(tweet));
});

app.get('/tweets', async (request, reply) => {
  const { authorId } = request.query as { authorId?: string };
  const tweets = await viewTimelineUseCase.execute({ authorId });
  reply.send(TweetApiPresenter.toListResponse(tweets));
});

app.put('/tweets/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { message, authorId } = request.body as { message: string; authorId: string };
  const result = await updateTweetUseCase.execute({ id, message, authorId });

  if (!result.success) {
    if (result.error instanceof TweetNotFoundError) {
      return reply.status(404).send({ error: result.error.message });
    }
    if (result.error instanceof UnauthorizedError) {
      return reply.status(403).send({ error: result.error.message });
    }
  }

  reply.status(204).send();
});

app.delete('/tweets/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { authorId } = request.body as { authorId: string };
  const result = await deleteTweetUseCase.execute({ id, authorId });

  if (!result.success) {
    if (result.error instanceof TweetNotFoundError)       return reply.status(404).send({ error: result.error.message });
    if (result.error instanceof TweetAlreadyDeletedError) return reply.status(410).send({ error: result.error.message });
    if (result.error instanceof UnauthorizedError)        return reply.status(403).send({ error: result.error.message });
  }

  reply.status(204).send();
});

app.post('/follows', async (request, reply) => {
  const { followerId, followedId } = request.body as { followerId: string; followedId: string };
  const result = await followUserUseCase.execute({ followerId, followedId });

  if (!result.success) {
    if (result.error instanceof UserAlreadyFollowsError) {
      return reply.status(409).send({ error: result.error.message });
    }
  }

  reply.status(201).send();
});

app.get('/wall/:userId', async (request, reply) => {
  const { userId } = request.params as { userId: string };
  const tweets = await viewWallUseCase.execute({ userId });
  reply.send(TweetApiPresenter.toListResponse(tweets));
});

app.setErrorHandler((error: Error, _request, reply) => {
  reply.status(400).send({ error: error.message });
});

const start = async () => {
  await app.listen({ port: 3000, host: '0.0.0.0' });
};

start();
