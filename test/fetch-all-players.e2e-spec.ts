import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { HttpModule } from '@/infra/http/http.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { makePlayer } from 'test/factories/player-factory';
import { makeSnapshot } from 'test/factories/snapshot-factory';
import { PrismaPlayerMapper } from '@/infra/database/prisma/mappers/prisma-player-mapper';
import { PrismaSnapshotMapper } from '@/infra/database/prisma/mappers/prisma-snapshot-mapper';
import { PrismaSnapshotRepository } from '@/infra/database/prisma/repositories/prisma-snapshot-repository';
import { SnapshotRepository } from '@/domain/league/application/repositories/snapshot-repository';

import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@/infra/env/env.schema';

describe('[GET] /players', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    validate: (env) => envSchema.parse(env),
                    isGlobal: true,
                }),
                DatabaseModule,
                HttpModule,
            ],
            providers: [
                {
                    provide: SnapshotRepository,
                    useClass: PrismaSnapshotRepository,
                }
            ]
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);

        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    test('should return paginated players with stats and snapshots', async () => {
        const player = makePlayer();
        await prisma.player.create({
            data: PrismaPlayerMapper.toPrisma(player),
        });

        const date = new Date();
        const snapshot1 = makeSnapshot({
            playerId: player.id.toString(),
            totalPoints: 100,
            createdAt: new Date(date.setHours(10, 0, 0, 0)),
        });
        const snapshot2 = makeSnapshot({
            playerId: player.id.toString(),
            totalPoints: 120,
            createdAt: new Date(date.setHours(11, 0, 0, 0)),
        });

        await prisma.snapshot.createMany({
            data: [
                PrismaSnapshotMapper.toPrisma(snapshot1),
                PrismaSnapshotMapper.toPrisma(snapshot2),
            ],
        });

        const response = await request(app.getHttpServer())
            .get('/players')
            .query({
                page: 1,
                limit: 10,
                from: new Date().toISOString().split('T')[0],
                to: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
            })
            .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].player.id).toBe(player.id.toString());
        expect(response.body.data[0].snapshots).toHaveLength(2);
        expect(response.body.data[0].stats).toEqual({
            pointsLostOrWon: 20,
            pointsLostOrWonLifetime: 20,
        });
    });
});
