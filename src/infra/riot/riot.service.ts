import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  RiotApiGateway,
  RiotSummonerDTO,
  RiotSummonerDetailsDTO,
} from '@/domain/league/application/gateways/riot-api-gateway';
import { EnvService } from '@/infra/env/env.service';

@Injectable()
export class RiotService implements RiotApiGateway {
  private apiKey: string;
  private riotAccountUrl: string;
  private riotSummonerUrl: string;

  constructor(private readonly envService: EnvService) {
    this.apiKey = this.envService.get('RIOT_API_KEY');
    this.riotAccountUrl = this.envService.get('RIOT_URL_ACCOUNT');
    this.riotSummonerUrl = this.envService.get('RIOT_URL_SUMMONER');
  }

  async getSummoner(
    name: string,
    tag: string,
  ): Promise<RiotSummonerDTO | null> {
    try {
      const accountUrl = `https://${this.riotAccountUrl}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`;
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
        throw new InternalServerErrorException(
          `Riot API error: ${accountResponse.statusText}`,
        );
      }

      const accountData = await accountResponse.json();
      const puuid = accountData.puuid;

      return {
        puuid: puuid,
        gameName: accountData.gameName,
        tagLine: accountData.tagLine,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching summoner: ${error}`,
      );
    }
  }

  async getSummonerDetails(
    puuid: string,
  ): Promise<RiotSummonerDetailsDTO | null> {
    try {
      const summonerUrl = `https://${this.riotSummonerUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      const summonerResponse = await fetch(summonerUrl, {
        method: 'GET',
        headers: {
          'X-Riot-Token': this.apiKey,
        },
      });

      if (summonerResponse.status === 404) {
        return null;
      }

      if (!summonerResponse.ok) {
        throw new InternalServerErrorException(
          `Riot API error: ${summonerResponse.statusText}`,
        );
      }

      const summonerData = await summonerResponse.json();

      return {
        profileIconId: summonerData.profileIconId,
        summonerLevel: summonerData.summonerLevel,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching summoner details');
    }
  }

  async getLeagueEntries(puuid: string): Promise<any[]> {
    try {
      const url = `https://${this.riotSummonerUrl}/lol/league/v4/entries/by-puuid/${puuid}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Riot-Token': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Riot API error: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching league entries: ${error}`,
      );
    }
  }
}
