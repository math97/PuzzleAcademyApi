import { Controller, Get } from '@nestjs/common';
import { FetchArenaLeaderboardUseCase } from '@/domain/league/application/use-cases/fetch-arena-leaderboard';
import { ArenaLeaderboardPresenter } from '../presenters/arena-leaderboard-presenter';

@Controller('/players/leaderboard/arena')
export class FetchArenaLeaderboardController {
  constructor(
    private fetchArenaLeaderboardUseCase: FetchArenaLeaderboardUseCase,
  ) {}

  @Get()
  async handle() {
    const result = await this.fetchArenaLeaderboardUseCase.execute();
    return result.entries.map(ArenaLeaderboardPresenter.toHTTP);
  }
}
