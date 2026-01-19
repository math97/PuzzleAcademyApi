import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  RiotApiGateway,
  RiotSummonerDTO,
  RiotSummonerDetailsDTO,
  RiotChampionMasteryDTO,
} from '@/domain/league/application/gateways/riot-api-gateway';
import { EnvService } from '@/infra/env/env.service';
import { RateLimiter } from '@/domain/league/application/gateways/rate-limiter';

@Injectable()
export class RiotService implements RiotApiGateway {
  private apiKey: string;
  private riotAccountUrl: string;
  private riotSummonerUrl: string;

  constructor(
    private readonly envService: EnvService,
    private readonly rateLimiter: RateLimiter,
  ) {
    this.apiKey = this.envService.get('RIOT_API_KEY');
    this.riotAccountUrl = this.envService.get('RIOT_URL_ACCOUNT');
    this.riotSummonerUrl = this.envService.get('RIOT_URL_SUMMONER');
  }

  async getSummoner(
    name: string,
    tag: string,
  ): Promise<RiotSummonerDTO | null> {
    return this.rateLimiter.schedule(async () => {
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
    });
  }

  async getSummonerDetails(
    puuid: string,
  ): Promise<RiotSummonerDetailsDTO | null> {
    return this.rateLimiter.schedule(async () => {
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
        throw new InternalServerErrorException(
          'Error fetching summoner details',
        );
      }
    });
  }

  async getLeagueEntries(puuid: string): Promise<any[]> {
    return this.rateLimiter.schedule(async () => {
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
    });
  }

  async getTopChampionMasteries(
    puuid: string,
  ): Promise<RiotChampionMasteryDTO[]> {
    return this.rateLimiter.schedule(async () => {
      try {
        const url = `https://${this.riotSummonerUrl}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3`;
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
          `Error fetching champion masteries: ${error}`,
        );
      }
    });
  }

  async getMatchesByPuuid(
    puuid: string,
    startTime?: number,
    endTime?: number,
    queue?: number,
  ): Promise<string[]> {
    const PAGE_SIZE = 100; // Max allowed by Riot API
    const allMatchIds: string[] = [];
    let start = 0;
    let hasMoreMatches = true;

    while (hasMoreMatches) {
      const pageMatchIds = await this.rateLimiter.schedule(async () => {
        const url = new URL(
          `https://${this.riotAccountUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        );
        url.searchParams.append('start', start.toString());
        url.searchParams.append('count', PAGE_SIZE.toString());

        if (startTime) {
          url.searchParams.append('startTime', startTime.toString());
        }
        if (endTime) {
          url.searchParams.append('endTime', endTime.toString());
        }
        if (queue) {
          url.searchParams.append('queue', queue.toString());
        }

        const response = await fetch(url.toString(), {
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

        return response.json() as Promise<string[]>;
      });

      allMatchIds.push(...pageMatchIds);

      if (pageMatchIds.length < PAGE_SIZE) {
        hasMoreMatches = false;
      } else {
        start += PAGE_SIZE;
      }
    }

    return allMatchIds;
  }

  async getMatchDetails(matchId: string): Promise<any> {
    return this.rateLimiter.schedule(async () => {
      try {
        const url = `https://${this.riotAccountUrl}/lol/match/v5/matches/${matchId}`;

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
          `Error fetching match details: ${error}`,
        );
      }
    });
  }
}
