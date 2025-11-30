import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RiotApiGateway, RiotSummonerDTO } from '@/domain/league/application/gateways/riot-api-gateway';
import { EnvService } from '@/infra/env/env.service';

@Injectable()
export class RiotService implements RiotApiGateway {
    private apiKey: string;
    private riotUrl: string;

    constructor(private readonly envService: EnvService) {
        this.apiKey = this.envService.get('RIOT_API_KEY');
        this.riotUrl = this.envService.get('RIOT_URL') || 'americas.api.riotgames.com';
    }

    async getSummoner(name: string, tag: string): Promise<RiotSummonerDTO | null> {
        try {
            const accountUrl = `https://${this.riotUrl}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`;
            const accountResponse = await fetch(accountUrl, {
                method: 'GET',
                headers: {
                    'X-Riot-Token': this.apiKey,
                },
            });

            if (accountResponse.status === 404) {
                return null;
            }

            if (!accountResponse.ok) {
                throw new InternalServerErrorException(`Riot API error: ${accountResponse.statusText}`);
            }

            const accountData = await accountResponse.json();
            const puuid = accountData.puuid;

            return {
                puuid: puuid,
                gameName: accountData.gameName,
                tagLine: accountData.tagLine,
            };
        } catch (error) {
            throw new InternalServerErrorException('Error fetching summoner');
        }
    }
}
