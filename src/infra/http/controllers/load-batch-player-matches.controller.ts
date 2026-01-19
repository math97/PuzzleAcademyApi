import { Controller, Post, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { MatchLoadingProducer } from '@/infra/queue/producers/match-loading.producer';
import { EnvService } from '@/infra/env/env.service';

@ApiTags('players')
@Controller('/players/matches/load/batch')
export class LoadBatchPlayerMatchesController {
  constructor(
    private matchLoadingProducer: MatchLoadingProducer,
    private playersRepository: PlayersRepository,
    private envService: EnvService,
  ) {}

  @Post()
  @HttpCode(202)
  @ApiOperation({ summary: 'Queue match loading for all players' })
  @ApiQuery({ name: 'startTime', required: false, type: Number })
  @ApiQuery({ name: 'endTime', required: false, type: Number })
  @ApiResponse({ status: 202, description: 'Jobs queued successfully' })
  async handle(
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<{ queued: number }> {
    const playerIds = await this.playersRepository.findAllIds();

    const seasonStartDate = this.envService.get('SEASON_START_DATE');
    const defaultStartTime = Math.floor(
      new Date(seasonStartDate).getTime() / 1000,
    );

    await this.matchLoadingProducer.publishBatchLoadMatchesJobs(
      playerIds,
      startTime ? Number(startTime) : defaultStartTime,
      endTime ? Number(endTime) : undefined,
    );

    return { queued: playerIds.length };
  }
}
