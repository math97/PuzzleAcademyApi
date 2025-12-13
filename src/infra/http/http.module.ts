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

import { LoadPlayerStatsController } from './controllers/load-player-stats.controller';
import { LoadPlayerStatsUseCase } from '@/domain/league/application/use-cases/load-player-stats';
import { LoadAllPlayersStatsController } from './controllers/load-all-players-stats.controller';
import { LoadAllPlayersStatsUseCase } from '@/domain/league/application/use-cases/load-all-players-stats';
import { UpdateChampionMasteriesController } from './controllers/update-champion-masteries.controller';
import { UpdateChampionMasteriesUseCase } from '@/domain/league/application/use-cases/update-champion-masteries';

@Module({
  imports: [DatabaseModule, RiotModule],
  controllers: [
    CreatePlayerController,
    GetSummonerDetailsController,
    FetchAllPlayersController,
    GetPlayerByIdController,
    LoadPlayerStatsController,
    LoadAllPlayersStatsController,
    UpdateChampionMasteriesController,
  ],
  providers: [
    AddPlayerUseCase,
    GetSummonerDetailsUseCase,
    FetchAllPlayersUseCase,
    GetPlayerByIdUseCase,
    LoadPlayerStatsUseCase,
    LoadAllPlayersStatsUseCase,
    UpdateChampionMasteriesUseCase,
  ],
})
export class HttpModule { }
