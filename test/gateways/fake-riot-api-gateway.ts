import {
  RiotApiGateway,
  RiotChampionMasteryDTO,
  RiotLeagueEntryDTO,
  RiotSummonerDetailsDTO,
  RiotSummonerDTO,
} from '@/domain/league/application/gateways/riot-api-gateway';

export class FakeRiotApiGateway implements RiotApiGateway {
  public summoner: RiotSummonerDTO | null = null;
  public details: RiotSummonerDetailsDTO | null = null;
  public leagueEntries: RiotLeagueEntryDTO[] = [];
  public masteries: RiotChampionMasteryDTO[] = [];

  public matches: string[] = [];
  public matchDetails: any = null;

  async getSummoner(
    name: string,
    tag: string,
  ): Promise<RiotSummonerDTO | null> {
    return this.summoner;
  }

  async getSummonerDetails(
    puuid: string,
  ): Promise<RiotSummonerDetailsDTO | null> {
    return this.details;
  }

  async getLeagueEntries(puuid: string): Promise<RiotLeagueEntryDTO[]> {
    return this.leagueEntries;
  }

  async getTopChampionMasteries(
    puuid: string,
  ): Promise<RiotChampionMasteryDTO[]> {
    return this.masteries;
  }

  async getMatchesByPuuid(
    puuid: string,
    startTime?: number,
    endTime?: number,
  ): Promise<string[]> {
    return this.matches;
  }

  async getMatchDetails(matchId: string): Promise<any> {
    return this.matchDetails;
  }
}
