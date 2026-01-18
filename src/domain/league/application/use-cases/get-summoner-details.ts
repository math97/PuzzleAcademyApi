import { Injectable, NotFoundException } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { RiotApiGateway } from '../gateways/riot-api-gateway';
import { Player } from '@/domain/league/enterprise/entities/player';

interface GetSummonerDetailsRequest {
  gameName: string;
  tag: string;
}

@Injectable()
export class GetSummonerDetailsUseCase {
  constructor(
    private playersRepository: PlayersRepository,
    private riotApiGateway: RiotApiGateway,
  ) {}

  async execute({ gameName, tag }: GetSummonerDetailsRequest): Promise<Player> {
    const player = await this.playersRepository.findByNameAndTag(gameName, tag);

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const details = await this.riotApiGateway.getSummonerDetails(
      player.riotPuiid,
    );

    if (details) {
      player.updateDetails({
        profileIconId: details.profileIconId,
        summonerLevel: details.summonerLevel,
      });

      const leagueEntries = await this.riotApiGateway.getLeagueEntries(
        player.riotPuiid,
      );

      const rankedEntry = leagueEntries.find(
        (entry) => entry.queueType === 'RANKED_SOLO_5x5',
      );

      if (rankedEntry) {
        player.updateStats({
          tier: rankedEntry.tier,
          rank: rankedEntry.rank,
          leaguePoints: rankedEntry.leaguePoints,
        });
      }

      await this.playersRepository.save(player);
    }

    return player;
  }
}
