import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Player } from '@/domain/league/enterprise/entities/player';
import { PlayersRepository } from '../repositories/players-repository';
import {
  RiotApiGateway,
  RiotChampionMasteryDTO,
} from '../gateways/riot-api-gateway';

interface AddPlayerUseCaseRequest {
  name: string;
  tag: string;
}

interface AddPlayerUseCaseResponse {
  player: Player;
}

@Injectable()
export class AddPlayerUseCase {
  constructor(
    private playersRepository: PlayersRepository,
    private riotApiGateway: RiotApiGateway,
  ) {}

  async execute({
    name,
    tag,
  }: AddPlayerUseCaseRequest): Promise<AddPlayerUseCaseResponse> {
    const riotSummoner = await this.riotApiGateway.getSummoner(name, tag);

    if (!riotSummoner) {
      throw new NotFoundException('Summoner not found');
    }

    const playerAlreadyExists = await this.playersRepository.findByPuuid(
      riotSummoner.puuid,
    );

    if (playerAlreadyExists) {
      throw new ConflictException('Player already exists');
    }

    const details = await this.riotApiGateway.getSummonerDetails(
      riotSummoner.puuid,
    );

    let masteries: RiotChampionMasteryDTO[] = [];
    try {
      masteries = await this.riotApiGateway.getTopChampionMasteries(
        riotSummoner.puuid,
      );
    } catch (error) {
      console.error('Failed to fetch champion masteries', error);
    }

    const player = Player.create({
      name: riotSummoner.gameName,
      tag: riotSummoner.tagLine,
      riotPuiid: riotSummoner.puuid,
      summonerLevel: details?.summonerLevel,
      profileIconId: details?.profileIconId,
      championMasteries: masteries.map((mastery) => ({
        championId: mastery.championId,
        championLevel: mastery.championLevel,
      })),
    });

    await this.playersRepository.insert(player);

    return {
      player,
    };
  }
}
