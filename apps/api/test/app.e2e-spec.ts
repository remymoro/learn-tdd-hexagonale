import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { ApiModule } from '../src/api.module';
import { InMemoryTweetRepository } from '@infrastructure/InMemoryTweetRepository';
import { InMemoryFollowRepository } from '@infrastructure/InMemoryFollowRepository';
import { TWEET_REPOSITORY, FOLLOW_REPOSITORY, CLOCK } from '@crafty/crafty/crafty.tokens';
import { type Clock } from '@crafty/crafty/shared/Clock';

class FakeClock implements Clock {
  now(): Date {
    return new Date('2024-01-15T10:00:00.000Z');
  }
}

describe('ApiController (e2e)', () => {
  let app: NestFastifyApplication;
  let tweetRepository: InMemoryTweetRepository;
  let followRepository: InMemoryFollowRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    })
      .overrideProvider(TWEET_REPOSITORY)
      .useClass(InMemoryTweetRepository)
      .overrideProvider(FOLLOW_REPOSITORY)
      .useClass(InMemoryFollowRepository)
      .overrideProvider(CLOCK)
      .useClass(FakeClock)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    tweetRepository = moduleFixture.get<InMemoryTweetRepository>(TWEET_REPOSITORY);
    followRepository = moduleFixture.get<InMemoryFollowRepository>(FOLLOW_REPOSITORY);
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── POST /tweets ───────────────────────────────────────────────────────────

  describe('POST /tweets', () => {
    it('crée un tweet et retourne 201 avec le tweet créé', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tweets',
        payload: { message: 'Bonjour le monde', authorId: 'alice' },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json<{ id: string; content: string; authorId: string }>();
      expect(body.content).toBe('Bonjour le monde');
      expect(body.authorId).toBe('alice');
      expect(body.id).toBeDefined();
    });
  });

  // ─── GET /tweets ────────────────────────────────────────────────────────────

  describe('GET /tweets', () => {
    it('retourne la timeline vide si aucun tweet', async () => {
      const response = await app.inject({ method: 'GET', url: '/tweets?authorId=alice' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ tweets: [] });
    });

    it('retourne les tweets de l\'auteur demandé', async () => {
      await app.inject({ method: 'POST', url: '/tweets', payload: { message: 'Tweet alice', authorId: 'alice' } });
      await app.inject({ method: 'POST', url: '/tweets', payload: { message: 'Tweet bob',   authorId: 'bob' } });

      const response = await app.inject({ method: 'GET', url: '/tweets?authorId=alice' });

      expect(response.statusCode).toBe(200);
      const { tweets } = response.json<{ tweets: { content: string; authorId: string }[] }>();
      expect(tweets).toHaveLength(1);
      expect(tweets[0]?.content).toBe('Tweet alice');
    });
  });

  // ─── PUT /tweets/:id ────────────────────────────────────────────────────────

  describe('PUT /tweets/:id', () => {
    it('met à jour le tweet et retourne 204', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/tweets',
        payload: { message: 'Avant', authorId: 'alice' },
      });
      const { id } = created.json<{ id: string }>();

      const response = await app.inject({
        method: 'PUT',
        url: `/tweets/${id}`,
        payload: { message: 'Après', authorId: 'alice' },
      });

      expect(response.statusCode).toBe(204);
    });

    it('retourne 404 si le tweet n\'existe pas', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/tweets/id-inexistant',
        payload: { message: 'Nouveau contenu', authorId: 'alice' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('retourne 403 si l\'auteur n\'est pas propriétaire du tweet', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/tweets',
        payload: { message: 'Mon tweet', authorId: 'alice' },
      });
      const { id } = created.json<{ id: string }>();

      const response = await app.inject({
        method: 'PUT',
        url: `/tweets/${id}`,
        payload: { message: 'Hacking', authorId: 'bob' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  // ─── DELETE /tweets/:id ─────────────────────────────────────────────────────

  describe('DELETE /tweets/:id', () => {
    it('supprime le tweet et retourne 204', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/tweets',
        payload: { message: 'À supprimer', authorId: 'alice' },
      });
      const { id } = created.json<{ id: string }>();

      const response = await app.inject({
        method: 'DELETE',
        url: `/tweets/${id}`,
        payload: { authorId: 'alice' },
      });

      expect(response.statusCode).toBe(204);
    });

    it('retourne 404 si le tweet n\'existe pas', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/tweets/id-inexistant',
        payload: { authorId: 'alice' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('retourne 403 si l\'auteur n\'est pas propriétaire', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/tweets',
        payload: { message: 'Mon tweet', authorId: 'alice' },
      });
      const { id } = created.json<{ id: string }>();

      const response = await app.inject({
        method: 'DELETE',
        url: `/tweets/${id}`,
        payload: { authorId: 'bob' },
      });

      expect(response.statusCode).toBe(403);
    });

    it('retourne 410 si le tweet est déjà supprimé', async () => {
      const created = await app.inject({
        method: 'POST',
        url: '/tweets',
        payload: { message: 'À supprimer', authorId: 'alice' },
      });
      const { id } = created.json<{ id: string }>();

      await app.inject({ method: 'DELETE', url: `/tweets/${id}`, payload: { authorId: 'alice' } });

      const response = await app.inject({
        method: 'DELETE',
        url: `/tweets/${id}`,
        payload: { authorId: 'alice' },
      });

      expect(response.statusCode).toBe(410);
    });
  });

  // ─── POST /follows ──────────────────────────────────────────────────────────

  describe('POST /follows', () => {
    it('crée la relation de follow et retourne 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/follows',
        payload: { followerId: 'alice', followedId: 'bob' },
      });

      expect(response.statusCode).toBe(201);
    });

    it('retourne 409 si alice suit déjà bob', async () => {
      await app.inject({ method: 'POST', url: '/follows', payload: { followerId: 'alice', followedId: 'bob' } });

      const response = await app.inject({
        method: 'POST',
        url: '/follows',
        payload: { followerId: 'alice', followedId: 'bob' },
      });

      expect(response.statusCode).toBe(409);
    });
  });

  // ─── GET /wall/:userId ──────────────────────────────────────────────────────

  describe('GET /wall/:userId', () => {
    it('retourne les tweets des utilisateurs suivis', async () => {
      await app.inject({ method: 'POST', url: '/follows',  payload: { followerId: 'alice', followedId: 'bob' } });
      await app.inject({ method: 'POST', url: '/tweets',   payload: { message: 'Tweet de bob', authorId: 'bob' } });
      await app.inject({ method: 'POST', url: '/tweets',   payload: { message: 'Tweet de charlie', authorId: 'charlie' } });

      const response = await app.inject({ method: 'GET', url: '/wall/alice' });

      expect(response.statusCode).toBe(200);
      const tweets = response.json<{ id: string; content: string; authorId: string }[]>();
      expect(tweets).toHaveLength(1);
      expect(tweets[0]?.content).toBe('Tweet de bob');
    });

    it('retourne une liste vide si l\'utilisateur ne suit personne', async () => {
      await app.inject({ method: 'POST', url: '/tweets', payload: { message: 'Tweet de bob', authorId: 'bob' } });

      const response = await app.inject({ method: 'GET', url: '/wall/alice' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });
  });
});
