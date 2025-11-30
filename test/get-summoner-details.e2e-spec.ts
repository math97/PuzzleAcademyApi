import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import request from 'supertest';
import { PlayerFactory } from './factories/player-factory';
import { DatabaseModule } from '@/infra/database/database.module';
import { RiotApiGateway } from '@/domain/league/application/gateways/riot-api-gateway';

describe('Get Summoner Details (E2E)', () => {
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

    test('[GET] /players/details', async () => {
        const riotApiGateway = app.get(RiotApiGateway);
        // Fetch real PUUID for a known player (Kami #BR1)
        // If this fails, make sure RIOT_API_KEY is set in .env.test
        const summoner = await riotApiGateway.getSummoner('Kami', 'BR1');

        if (!summoner) {
            throw new Error('Could not fetch summoner from Riot API. Check API Key.');
        }

        const player = await playerFactory.makePrismaPlayer({
            name: 'Kami',
            tag: 'BR1',
            riotPuiid: summoner.puuid,
        });

        const response = await request(app.getHttpServer())
            .get('/players/details')
            .query({
                gameName: 'Kami',
                tag: 'BR1',
            });

        expect(response.statusCode).toBe(200);

        const playerOnDb = await prisma.player.findUnique({
            where: {
                id: player.id.toString(),
            },
        });

        expect(playerOnDb?.profileIconId).toBeTruthy();
        expect(playerOnDb?.summonerLevel).toBeTruthy();
    });
});
