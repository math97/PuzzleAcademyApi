import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PlayerFactory } from './factories/player-factory';
import { DatabaseModule } from '@/infra/database/database.module';
import request from 'supertest';

describe('Fetch All Players (E2E)', () => {
    let app: INestApplication;
    let playerFactory: PlayerFactory;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PlayerFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        playerFactory = moduleRef.get(PlayerFactory);

        await app.init();
    });

    test('[GET] /players', async () => {
        for (let i = 1; i <= 22; i++) {
            await playerFactory.makePrismaPlayer({
                name: `Player ${i}`,
                tag: 'BR1',
                riotPuiid: `puuid-${i}`,
            });
        }

        const response = await request(app.getHttpServer())
            .get('/players')
            .query({
                page: 2,
                limit: 10,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveLength(10);
        expect(response.body.meta.total).toBe(22);
        expect(response.body.meta.page).toBe(2);
        expect(response.body.meta.lastPage).toBe(3);
    });

    test('[GET] /players (defaults)', async () => {
        const response = await request(app.getHttpServer())
            .get('/players');

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveLength(20);
        expect(response.body.meta.total).toBe(22);
        expect(response.body.meta.page).toBe(1);
        expect(response.body.meta.lastPage).toBe(2);
    });
});
