export interface RiotSummonerDTO {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export interface RiotSummonerDetailsDTO {
    profileIconId: number;
    summonerLevel: number;
}

export abstract class RiotApiGateway {
    abstract getSummoner(name: string, tag: string): Promise<RiotSummonerDTO | null>;
    abstract getSummonerDetails(puuid: string): Promise<RiotSummonerDetailsDTO | null>;
}
