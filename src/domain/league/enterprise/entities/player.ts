import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface PlayerProps {
  name: string;
  tag: string;
  riotPuiid: string;
  tier?: string | null;
  rank?: string | null;
  leaguePoints?: number | null;
  flexTier?: string | null;
  flexRank?: string | null;
  flexLeaguePoints?: number | null;
  profileIconId?: number | null;
  summonerLevel?: number | null;
  championMasteries?: ChampionMastery[];
  stats?: PlayerStats;
}

export interface PlayerStats {
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  bestMatchKda: number;
}

export interface ChampionMastery {
  championId: number;
  championLevel: number;
}

export class Player extends Entity<PlayerProps> {
  get name() {
    return this.props.name;
  }

  get tag() {
    return this.props.tag;
  }

  get riotPuiid() {
    return this.props.riotPuiid;
  }

  get tier() {
    return this.props.tier;
  }

  get rank() {
    return this.props.rank;
  }

  get leaguePoints() {
    return this.props.leaguePoints;
  }

  get flexTier() {
    return this.props.flexTier;
  }

  get flexRank() {
    return this.props.flexRank;
  }

  get flexLeaguePoints() {
    return this.props.flexLeaguePoints;
  }

  get profileIconId() {
    return this.props.profileIconId;
  }

  get summonerLevel() {
    return this.props.summonerLevel;
  }

  get championMasteries() {
    return this.props.championMasteries;
  }

  get stats() {
    return this.props.stats;
  }

  static create(
    props: Optional<
      PlayerProps,
      | 'tier'
      | 'rank'
      | 'leaguePoints'
      | 'flexTier'
      | 'flexRank'
      | 'flexLeaguePoints'
      | 'profileIconId'
      | 'summonerLevel'
      | 'stats'
    >,
    id?: UniqueEntityId,
  ) {
    const player = new Player(
      {
        ...props,
        tier: props.tier ?? null,
        rank: props.rank ?? null,
        leaguePoints: props.leaguePoints ?? null,
        flexTier: props.flexTier ?? null,
        flexRank: props.flexRank ?? null,
        flexLeaguePoints: props.flexLeaguePoints ?? null,
        profileIconId: props.profileIconId ?? null,
        summonerLevel: props.summonerLevel ?? null,
        championMasteries: props.championMasteries ?? [],
        stats: props.stats ?? {
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          bestMatchKda: 0,
        },
      },
      id,
    );

    return player;
  }

  updateDetails(details: { profileIconId: number; summonerLevel: number }) {
    this.props.profileIconId = details.profileIconId;
    this.props.summonerLevel = details.summonerLevel;
  }

  updateStats(stats: { tier: string; rank: string; leaguePoints: number }) {
    this.props.tier = stats.tier;
    this.props.rank = stats.rank;
    this.props.leaguePoints = stats.leaguePoints;
  }

  updateFlexStats(stats: { tier: string; rank: string; leaguePoints: number }) {
    this.props.flexTier = stats.tier;
    this.props.flexRank = stats.rank;
    this.props.flexLeaguePoints = stats.leaguePoints;
  }

  updateChampionMasteries(masteries: ChampionMastery[]) {
    this.props.championMasteries = masteries;
  }

  updateAggregatedStats(
    matches: { kills: number; deaths: number; assists: number }[],
  ) {
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let bestMatchKda = 0;

    for (const match of matches) {
      totalKills += match.kills;
      totalDeaths += match.deaths;
      totalAssists += match.assists;

      const kda =
        match.deaths === 0
          ? match.kills + match.assists
          : (match.kills + match.assists) / match.deaths;

      if (kda > bestMatchKda) {
        bestMatchKda = Number(kda.toFixed(2));
      }
    }

    this.props.stats = {
      totalKills,
      totalDeaths,
      totalAssists,
      bestMatchKda,
    };
  }
}
