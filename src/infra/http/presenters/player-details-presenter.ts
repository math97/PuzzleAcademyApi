import { PlayerPresenter } from './player-presenter';
import { SnapshotPresenter } from './snapshot-presenter';
import { Player } from '@/domain/league/enterprise/entities/player';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';

export interface PlayerStats {
  pointsLostOrWon: number;
  pointsLostOrWonLifetime: number;
}

export interface PlayerDetailsResponse {
  player: Player;
  snapshots: Snapshot[];
  stats: PlayerStats;
}

export class PlayerDetailsPresenter {
  static toHTTP(details: PlayerDetailsResponse) {
    return {
      player: PlayerPresenter.toHTTP(details.player),
      snapshots: details.snapshots.map(SnapshotPresenter.toHTTP),
      stats: details.stats,
    };
  }
}
