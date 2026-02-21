import { Injectable, NotFoundException } from '@nestjs/common';
import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { Player } from '@/domain/league/enterprise/entities/player';
import { SnapshotRepository } from '@/domain/league/application/repositories/snapshot-repository';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';

interface GetPlayerByIdRequest {
  id: string;
  from?: Date;
  to?: Date;
}

export interface PlayerStats {
  pointsLostOrWon: number;
  winsChange: number;
  lossesChange: number;
}

export interface QueueStats {
  snapshots: Snapshot[];
  stats: PlayerStats;
}

export interface GetPlayerByIdResponse {
  player: Player;
  solo: QueueStats;
  flex: QueueStats;
}

@Injectable()
export class GetPlayerByIdUseCase {
  constructor(
    private playersRepository: PlayersRepository,
    private snapshotRepository: SnapshotRepository,
  ) {}

  async execute({
    id,
    from,
    to,
  }: GetPlayerByIdRequest): Promise<GetPlayerByIdResponse> {
    const player = await this.playersRepository.findById(id);

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const { startDate, endDate } = this.getDateRange(from, to);

    const snapshots = await this.snapshotRepository.findByPlayerIdAndDateRange(
      id,
      startDate,
      endDate,
    );

    // Filter snapshots by queue type
    const soloSnapshots = snapshots.filter(
      (s) => s.queueType === 'RANKED_SOLO_5x5',
    );
    const flexSnapshots = snapshots.filter(
      (s) => s.queueType === 'RANKED_FLEX_SR',
    );

    const soloStats = this.calculateStats(soloSnapshots);
    const flexStats = this.calculateStats(flexSnapshots);

    return {
      player,
      solo: {
        snapshots: soloSnapshots,
        stats: soloStats,
      },
      flex: {
        snapshots: flexSnapshots,
        stats: flexStats,
      },
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

  private calculateStats(snapshots: Snapshot[]): PlayerStats {
    let pointsLostOrWon = 0;
    let winsChange = 0;
    let lossesChange = 0;

    if (snapshots.length > 0) {
      const first = snapshots[0];
      const last = snapshots[snapshots.length - 1];
      pointsLostOrWon = last.totalPoints - first.totalPoints;
      winsChange = last.wins - first.wins;
      lossesChange = last.losses - first.losses;
    }

    return {
      pointsLostOrWon,
      winsChange,
      lossesChange,
    };
  }
}
