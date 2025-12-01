import { Module } from '@nestjs/common';
import { CreatePlayerController } from './controllers/create-player.controller';
import { AddPlayerUseCase } from '@/domain/league/application/use-cases/add-player';
import { DatabaseModule } from '../database/database.module';
import { RiotModule } from '../riot/riot.module';

import { GetSummonerDetailsController } from './controllers/get-summoner-details.controller';
import { FetchAllPlayersController } from './controllers/fetch-all-players.controller';
import { GetPlayerByIdController } from './controllers/get-player-by-id.controller';
import { GetSummonerDetailsUseCase } from '@/domain/league/application/use-cases/get-summoner-details';
import { FetchAllPlayersUseCase } from '@/domain/league/application/use-cases/fetch-all-players';
import { GetPlayerByIdUseCase } from '@/domain/league/application/use-cases/get-player-by-id';

@Module({
    imports: [DatabaseModule, RiotModule],
    controllers: [CreatePlayerController, GetSummonerDetailsController, FetchAllPlayersController, GetPlayerByIdController],
    providers: [AddPlayerUseCase, GetSummonerDetailsUseCase, FetchAllPlayersUseCase, GetPlayerByIdUseCase],
})
export class HttpModule { }
