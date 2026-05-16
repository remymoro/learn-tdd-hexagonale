import Fastify from 'fastify';
import { PrismaTweetRepository } from '@infrastructure/PrismaTweetRepository';
import { PrismaFollowRepository } from '@infrastructure/PrismaFollowRepository';
import { PublishTweetUseCase } from '@application/tweet/PublishTweetUseCase';
import { ViewTimelineUseCase } from '@application/tweet/ViewTimelineUseCase';
import { UpdateTweetUseCase } from '@application/tweet/UpdateTweetUseCase';
import { FollowUserUseCase } from '@application/user/FollowUserUseCase';
import { ViewWallUseCase } from '@application/user/ViewWallUseCase';
import { TweetApiPresenter } from './presenters/TweetApiPresenter';

const tweetRepository = new PrismaTweetRepository();
const followRepository = new PrismaFollowRepository();

const publishTweetUseCase = new PublishTweetUseCase(tweetRepository);
const viewTimelineUseCase = new ViewTimelineUseCase(tweetRepository);
const updateTweetUseCase = new UpdateTweetUseCase(tweetRepository);
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
  await updateTweetUseCase.execute({ id, message, authorId });
  reply.status(204).send();
});

app.post('/follows', async (request, reply) => {
  const { followerId, followedId } = request.body as { followerId: string; followedId: string };
  await followUserUseCase.execute({ followerId, followedId });
  reply.status(201).send();
});

app.get('/wall/:userId', async (request, reply) => {
  const { userId } = request.params as { userId: string };
  const tweets = await viewWallUseCase.execute({ userId });
  reply.send(TweetApiPresenter.toListResponse(tweets));
});

app.setErrorHandler((error: Error, _request, reply) => {
  const statusCode = error.message === 'Tweet not found' ? 404
    : error.message === 'Unauthorized' ? 403
    : 400;
  reply.status(statusCode).send({ error: error.message });
});

const start = async () => {
  await app.listen({ port: 3000, host: '0.0.0.0' });
};

start();
