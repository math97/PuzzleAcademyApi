import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export interface MatchParticipantProps {
  puuid: string;
  summonerName: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  totalDamageDealt: number;
  visionScore: number;
  placement: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  largestKillingSpree: number;
  pentaKills: number;
}

export class MatchParticipant extends Entity<MatchParticipantProps> {
  get puuid() {
    return this.props.puuid;
  }

  get summonerName() {
    return this.props.summonerName;
  }

  get championName() {
    return this.props.championName;
  }

  get kills() {
    return this.props.kills;
  }

  get deaths() {
    return this.props.deaths;
  }

  get assists() {
    return this.props.assists;
  }

  get win() {
    return this.props.win;
  }

  get totalDamageDealt() {
    return this.props.totalDamageDealt;
  }

  get visionScore() {
    return this.props.visionScore;
  }

  get placement() {
    return this.props.placement;
  }

  get totalDamageDealtToChampions() {
    return this.props.totalDamageDealtToChampions;
  }

  get totalDamageTaken() {
    return this.props.totalDamageTaken;
  }

  get largestKillingSpree() {
    return this.props.largestKillingSpree;
  }

  get pentaKills() {
    return this.props.pentaKills;
  }

  static create(
    props: Omit<MatchParticipantProps, 'placement' | 'totalDamageDealtToChampions' | 'totalDamageTaken' | 'largestKillingSpree' | 'pentaKills'> & Partial<Pick<MatchParticipantProps, 'placement' | 'totalDamageDealtToChampions' | 'totalDamageTaken' | 'largestKillingSpree' | 'pentaKills'>>,
    id?: UniqueEntityId,
  ) {
    const participant = new MatchParticipant(
      {
        ...props,
        placement: props.placement ?? 0,
        totalDamageDealtToChampions: props.totalDamageDealtToChampions ?? 0,
        totalDamageTaken: props.totalDamageTaken ?? 0,
        largestKillingSpree: props.largestKillingSpree ?? 0,
        pentaKills: props.pentaKills ?? 0,
      },
      id,
    );
    return participant;
  }
}
