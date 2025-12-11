import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaTestEnvironment } from './utils/prisma-test-environment';

describe('CreatePlayerController (e2e)', () => {
  let app: INestApplication;
  const prismaTestEnvironment = new PrismaTestEnvironment();

  beforeAll(async () => {
    await prismaTestEnvironment.setup();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prismaTestEnvironment.teardown();
  });

  it('should create a new player', async () => {
    const response = await request(app.getHttpServer()).post('/players').send({
      gameName: 'ThorMath',
      tagLine: 'BR1',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      gameName: 'ThorMath',
      tagLine: 'br1',
      puuid: expect.any(String),
      tier: null,
      rank: null,
      leaguePoints: null,
      profileIconId: expect.any(Number),
      summonerLevel: expect.any(Number),
    });
  });

  it('should return 409 if player already exists', async () => {
    const response = await request(app.getHttpServer()).post('/players').send({
      gameName: 'ThorMath',
      tagLine: 'BR1',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'Player already exists',
      error: 'Conflict',
      statusCode: 409,
    });
  });
});
