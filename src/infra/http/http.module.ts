import { Module } from '@nestjs/common';
import { CreatePlayerController } from './controllers/create-player.controller';
import { AddPlayerUseCase } from '@/domain/league/application/use-cases/add-player';
import { DatabaseModule } from '../database/database.module';
import { RiotModule } from '../riot/riot.module';

import { GetSummonerDetailsController } from './controllers/get-summoner-details.controller';
import { FetchAllPlayersController } from './controllers/fetch-all-players.controller';
import { GetSummonerDetailsUseCase } from '@/domain/league/application/use-cases/get-summoner-details';
import { FetchAllPlayersUseCase } from '@/domain/league/application/use-cases/fetch-all-players';

@Module({
    imports: [DatabaseModule, RiotModule],
    controllers: [CreatePlayerController, GetSummonerDetailsController, FetchAllPlayersController],
    providers: [AddPlayerUseCase, GetSummonerDetailsUseCase, FetchAllPlayersUseCase],
})
export class HttpModule { }
