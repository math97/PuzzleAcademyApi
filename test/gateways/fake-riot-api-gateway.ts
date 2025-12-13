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

    async getSummoner(name: string, tag: string): Promise<RiotSummonerDTO | null> {
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
}
