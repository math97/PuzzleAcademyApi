import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import request from 'supertest';
import { PlayerFactory } from 'test/factories/player-factory';
import { DatabaseModule } from '@/infra/database/database.module';
import { vi, describe, beforeAll, test, expect } from 'vitest';

describe('Load Player Stats (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let playerFactory: PlayerFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [PlayerFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    playerFactory = moduleRef.get(PlayerFactory);

    await app.init();
  });

  test('[POST] /players/stats', async () => {
    const player = await playerFactory.makePrismaPlayer({
      riotPuiid: 'test-puuid',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          queueType: 'RANKED_SOLO_5x5',
          tier: 'PLATINUM',
          rank: 'II',
          leaguePoints: 50,
          wins: 100,
          losses: 90,
          hotStreak: true,
        },
      ],
    } as any);

    const response = await request(app.getHttpServer())
      .post('/players/stats')
      .send({
        id: player.id.toString(),
      })
      .expect(200);

    expect(response.body.player).toEqual(
      expect.objectContaining({
        id: player.id.toString(),
        tier: 'PLATINUM',
        rank: 'II',
        leaguePoints: 50,
      }),
    );

    expect(response.body.snapshots).toHaveLength(1);
    expect(response.body.snapshots[0]).toEqual(
      expect.objectContaining({
        playerId: player.id.toString(),
        tier: 'PLATINUM',
        rank: 'II',
        leaguePoints: 50,
      }),
    );

    const snapshotOnDatabase = await prisma.snapshot.findFirst({
      where: {
        playerId: player.id.toString(),
      },
    });

    expect(snapshotOnDatabase).toBeTruthy();
    expect(snapshotOnDatabase?.tier).toBe('PLATINUM');
  });
});
