import { Controller, Post, HttpCode } from '@nestjs/common';
import { LoadAllPlayersStatsUseCase } from '@/domain/league/application/use-cases/load-all-players-stats';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('players')
@Controller('/players/stats/all')
export class LoadAllPlayersStatsController {
  constructor(private loadAllPlayersStats: LoadAllPlayersStatsUseCase) {}

  @Post()
  @HttpCode(202)
  @ApiOperation({ summary: 'Load stats for all players from Riot API' })
  @ApiResponse({ status: 202, description: 'Process started successfully.' })
  async handle() {
    // The requirement says "Load for stats for all players".
    // This endpoint will be triggered by n8n as a job, so we return immediately.
    this.loadAllPlayersStats.execute();
  }
}
