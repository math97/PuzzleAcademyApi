import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PlayerFactory } from './factories/player-factory';
import { DatabaseModule } from '@/infra/database/database.module';
import request from 'supertest';

describe('Get Player By ID (E2E)', () => {
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

    test('[GET] /players/:id', async () => {
        const player = await playerFactory.makePrismaPlayer({
            name: 'John Doe',
        });

        const response = await request(app.getHttpServer())
            .get(`/players/${player.id.toString()}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.id).toBe(player.id.toString());
        expect(response.body.data.gameName).toBe('John Doe');
    });

    test('[GET] /players/:id (Not Found)', async () => {
        const response = await request(app.getHttpServer())
            .get('/players/550e8400-e29b-41d4-a716-446655440000');

        expect(response.statusCode).toBe(404);
    });

    test('[GET] /players/:id (Invalid UUID)', async () => {
        const response = await request(app.getHttpServer())
            .get('/players/invalid-uuid');

        expect(response.statusCode).toBe(400);
    });
});
