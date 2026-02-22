import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface PlayerQueueStatsProps {
  playerId: string;
  queueType: string;
  totalGames: number;
  totalWins: number;
  totalTop4: number;
  avgPlacement: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  bestMatchKda: number;
  totalDamageDealtToChampions: bigint;
  totalDamageTaken: bigint;
  totalPentaKills: number;
  bestKillingSpree: number;
}

export class PlayerQueueStats extends Entity<PlayerQueueStatsProps> {
  get playerId() {
    return this.props.playerId;
  }

  get queueType() {
    return this.props.queueType;
  }

  get totalGames() {
    return this.props.totalGames;
  }

  get totalWins() {
    return this.props.totalWins;
  }

  get totalTop4() {
    return this.props.totalTop4;
  }

  get avgPlacement() {
    return this.props.avgPlacement;
  }

  get totalKills() {
    return this.props.totalKills;
  }

  get totalDeaths() {
    return this.props.totalDeaths;
  }

  get totalAssists() {
    return this.props.totalAssists;
  }

  get bestMatchKda() {
    return this.props.bestMatchKda;
  }

  get totalDamageDealtToChampions() {
    return this.props.totalDamageDealtToChampions;
  }

  get totalDamageTaken() {
    return this.props.totalDamageTaken;
  }

  get totalPentaKills() {
    return this.props.totalPentaKills;
  }

  get bestKillingSpree() {
    return this.props.bestKillingSpree;
  }

  static create(
    props: Optional<
      PlayerQueueStatsProps,
      | 'totalGames'
      | 'totalWins'
      | 'totalTop4'
      | 'avgPlacement'
      | 'totalKills'
      | 'totalDeaths'
      | 'totalAssists'
      | 'bestMatchKda'
      | 'totalDamageDealtToChampions'
      | 'totalDamageTaken'
      | 'totalPentaKills'
      | 'bestKillingSpree'
    >,
    id?: UniqueEntityId,
  ) {
    return new PlayerQueueStats(
      {
        ...props,
        totalGames: props.totalGames ?? 0,
        totalWins: props.totalWins ?? 0,
        totalTop4: props.totalTop4 ?? 0,
        avgPlacement: props.avgPlacement ?? 0,
        totalKills: props.totalKills ?? 0,
        totalDeaths: props.totalDeaths ?? 0,
        totalAssists: props.totalAssists ?? 0,
        bestMatchKda: props.bestMatchKda ?? 0,
        totalDamageDealtToChampions: props.totalDamageDealtToChampions ?? BigInt(0),
        totalDamageTaken: props.totalDamageTaken ?? BigInt(0),
        totalPentaKills: props.totalPentaKills ?? 0,
        bestKillingSpree: props.bestKillingSpree ?? 0,
      },
      id,
    );
  }
}
