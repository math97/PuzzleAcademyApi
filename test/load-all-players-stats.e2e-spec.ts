import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import request from 'supertest';
import { PlayerFactory } from 'test/factories/player-factory';
import { DatabaseModule } from '@/infra/database/database.module';
import { vi, describe, beforeAll, test, expect } from 'vitest';

describe('Load All Players Stats (E2E)', () => {
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

    test('[POST] /players/stats/all', async () => {
        const player1 = await playerFactory.makePrismaPlayer({
            riotPuiid: 'puuid-1',
        });
        const player2 = await playerFactory.makePrismaPlayer({
            riotPuiid: 'puuid-2',
        });

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ([
                {
                    queueType: 'RANKED_SOLO_5x5',
                    tier: 'PLATINUM',
                    rank: 'II',
                    leaguePoints: 50,
                    wins: 100,
                    losses: 90,
                    hotStreak: true,
                },
            ]),
        } as any);

        await request(app.getHttpServer())
            .post('/players/stats/all')
            .expect(202);

        // Wait for background processing to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify snapshots were created for both players
        const snapshots1 = await prisma.snapshot.findMany({
            where: { playerId: player1.id.toString() },
        });
        const snapshots2 = await prisma.snapshot.findMany({
            where: { playerId: player2.id.toString() },
        });

        expect(snapshots1).toHaveLength(1);
        expect(snapshots2).toHaveLength(1);
    });
});
