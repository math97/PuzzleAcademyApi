import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { LoadPlayerStatsUseCase } from '@/domain/league/application/use-cases/load-player-stats';
import { PlayerStatsPresenter } from '../presenters/player-stats-presenter';
import { SnapshotPresenter } from '../presenters/snapshot-presenter';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

class LoadPlayerStatsDto {
    id!: string;
}

@ApiTags('players')
@Controller('/players/stats')
export class LoadPlayerStatsController {
    constructor(private loadPlayerStats: LoadPlayerStatsUseCase) { }

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Load player stats from Riot API' })
    @ApiResponse({ status: 200, description: 'Player stats loaded successfully.' })
    @ApiBody({ type: LoadPlayerStatsDto })
    async handle(@Body() body: LoadPlayerStatsDto) {
        const { id } = body;
        const result = await this.loadPlayerStats.execute({
            playerId: id,
        });

        return {
            player: PlayerStatsPresenter.toHTTP(result.player),
            snapshots: result.snapshots.map(SnapshotPresenter.toHTTP),
        };
    }
}
