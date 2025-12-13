export interface RiotSummonerDTO {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface RiotSummonerDetailsDTO {
  profileIconId: number;
  summonerLevel: number;
}

export interface RiotLeagueEntryDTO {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
}

export interface RiotChampionMasteryDTO {
  puuid: string;
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  markRequiredForNextLevel: number;
  tokensEarned: number;
  championSeasonMilestone: number;
}

export abstract class RiotApiGateway {
  abstract getSummoner(
    name: string,
    tag: string,
  ): Promise<RiotSummonerDTO | null>;
  abstract getSummonerDetails(
    puuid: string,
  ): Promise<RiotSummonerDetailsDTO | null>;
  abstract getLeagueEntries(puuid: string): Promise<RiotLeagueEntryDTO[]>;
  abstract getTopChampionMasteries(
    puuid: string,
  ): Promise<RiotChampionMasteryDTO[]>;
}
