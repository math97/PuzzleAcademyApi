import { Injectable } from '@nestjs/common';
import { PlayerQueueStatsRepository } from '../repositories/player-queue-stats-repository';
import { PlayersRepository } from '../repositories/players-repository';
import { PlayerQueueStats } from '@/domain/league/enterprise/entities/player-queue-stats';
import { Player } from '@/domain/league/enterprise/entities/player';

export interface ArenaLeaderboardEntry {
  stats: PlayerQueueStats;
  player: Player;
}

interface FetchArenaLeaderboardUseCaseResponse {
  entries: ArenaLeaderboardEntry[];
}

@Injectable()
export class FetchArenaLeaderboardUseCase {
  constructor(
    private playerQueueStatsRepository: PlayerQueueStatsRepository,
    private playersRepository: PlayersRepository,
  ) {}

  async execute(): Promise<FetchArenaLeaderboardUseCaseResponse> {
    const statsList =
      await this.playerQueueStatsRepository.findAllByQueueType('ARENA');

    const puuids = statsList.map((s) => s.playerId);
    const players = await this.playersRepository.findManyByIds(puuids);

    const playerMap = new Map<string, Player>(
      players.map((p) => [p.id.toString(), p]),
    );

    const entries: ArenaLeaderboardEntry[] = statsList
      .map((stats) => {
        const player = playerMap.get(stats.playerId);
        if (!player) return null;
        return { stats, player };
      })
      .filter((e): e is ArenaLeaderboardEntry => e !== null)
      .sort((a, b) => a.stats.avgPlacement - b.stats.avgPlacement);

    return { entries };
  }
}
