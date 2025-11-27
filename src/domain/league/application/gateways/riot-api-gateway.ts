export interface RiotSummonerDTO {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export abstract class RiotApiGateway {
    abstract getSummoner(name: string, tag: string): Promise<RiotSummonerDTO | null>;
}
