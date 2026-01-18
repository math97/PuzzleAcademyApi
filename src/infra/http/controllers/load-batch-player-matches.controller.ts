import { Controller, Post, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { MatchLoadingProducer } from '@/infra/queue/producers/match-loading.producer';

@ApiTags('players')
@Controller('/players/matches/load/batch')
export class LoadBatchPlayerMatchesController {
  constructor(
    private matchLoadingProducer: MatchLoadingProducer,
    private playersRepository: PlayersRepository,
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

    await this.matchLoadingProducer.publishBatchLoadMatchesJobs(
      playerIds,
      startTime ? Number(startTime) : undefined,
      endTime ? Number(endTime) : undefined,
    );

    return { queued: playerIds.length };
  }
}
