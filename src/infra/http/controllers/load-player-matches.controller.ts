import { Controller, Post, Param, Query, HttpCode } from '@nestjs/common';
import { LoadPlayerMatchesUseCase } from '@/domain/league/application/use-cases/load-player-matches';
import { MatchPresenter } from '../presenters/match-presenter';

@Controller('/players/:id/matches')
export class LoadPlayerMatchesController {
  constructor(private loadPlayerMatchesUseCase: LoadPlayerMatchesUseCase) {}

  @Post('/load')
  @HttpCode(200)
  async handle(
    @Param('id') id: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const result = await this.loadPlayerMatchesUseCase.execute({
      playerId: id,
      startTime: startTime ? Number(startTime) : undefined,
      endTime: endTime ? Number(endTime) : undefined,
    });

    return result.matches.map(MatchPresenter.toHTTP);
  }
}
