import { Injectable } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { PaginatedResult } from '@/core/repositories/paginated-result';
import { Player } from '@/domain/league/enterprise/entities/player';
import { SnapshotRepository } from '@/domain/league/application/repositories/snapshot-repository';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';

interface FetchAllPlayersRequest {
  page: number;
  limit: number;
  from?: Date;
  to?: Date;
}

export interface PlayerStats {
  pointsLostOrWon: number;
  pointsLostOrWonLifetime: number;
}

export interface PlayerDetailsResponse {
  player: Player;
  snapshots: Snapshot[];
  stats: PlayerStats;
}

@Injectable()
export class FetchAllPlayersUseCase {
  constructor(
    private playersRepository: PlayersRepository,
    private snapshotRepository: SnapshotRepository,
  ) {}

  async execute({
    page,
    limit,
    from,
    to,
  }: FetchAllPlayersRequest): Promise<PaginatedResult<PlayerDetailsResponse>> {
    const result = await this.playersRepository.findAll({
      page,
      limit,
    });

    const { startDate, endDate } = this.getDateRange(from, to);

    const data: PlayerDetailsResponse[] = await Promise.all(
      result.data.map(async (player) => {
        const snapshots =
          await this.snapshotRepository.findByPlayerIdAndDateRange(
            player.id.toString(),
            startDate,
            endDate,
          );
        const firstEverSnapshot =
          await this.snapshotRepository.findFirstByPlayerId(
            player.id.toString(),
          );
        const stats = this.calculateStats(snapshots, firstEverSnapshot);

        return {
          player,
          snapshots,
          stats,
        };
      }),
    );

    return {
      data,
      meta: result.meta,
    };
  }

  private getDateRange(
    from?: Date,
    to?: Date,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();

    if (from && to) {
      return { startDate: from, endDate: to };
    }

    if (from) {
      return { startDate: from, endDate: now };
    }

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return { startDate: startOfDay, endDate: endOfDay };
  }

  private calculateStats(
    snapshots: Snapshot[],
    firstEverSnapshot: Snapshot | null,
  ): PlayerStats {
    let pointsLostOrWon = 0;
    let pointsLostOrWonLifetime = 0;

    if (snapshots.length > 0) {
      const first = snapshots[0];
      const last = snapshots[snapshots.length - 1];
      pointsLostOrWon = last.totalPoints - first.totalPoints;

      if (firstEverSnapshot) {
        pointsLostOrWonLifetime =
          last.totalPoints - firstEverSnapshot.totalPoints;
      }
    }

    return {
      pointsLostOrWon,
      pointsLostOrWonLifetime,
    };
  }
}
