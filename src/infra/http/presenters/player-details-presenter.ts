import { PlayerPresenter } from './player-presenter';
import { SnapshotPresenter } from './snapshot-presenter';
import { Player } from '@/domain/league/enterprise/entities/player';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';

export interface PlayerStats {
  pointsLostOrWon: number;
}

export interface QueueStats {
  snapshots: Snapshot[];
  stats: PlayerStats;
}

export interface PlayerDetailsResponse {
  player: Player;
  solo: QueueStats;
  flex: QueueStats;
}

export class PlayerDetailsPresenter {
  static toHTTP(details: PlayerDetailsResponse) {
    return {
      player: PlayerPresenter.toHTTP(details.player),
      solo: {
        snapshots: details.solo.snapshots.map(SnapshotPresenter.toHTTP),
        stats: details.solo.stats,
      },
      flex: {
        snapshots: details.flex.snapshots.map(SnapshotPresenter.toHTTP),
        stats: details.flex.stats,
      },
    };
  }
}
