import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Player } from '@/domain/league/enterprise/entities/player';
import { PlayersRepository } from '../repositories/players-repository';
import { RiotApiGateway } from '../gateways/riot-api-gateway';

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

    const player = Player.create({
      name: riotSummoner.gameName,
      tag: riotSummoner.tagLine,
      riotPuiid: riotSummoner.puuid,
    });

    await this.playersRepository.insert(player);

    return {
      player,
    };
  }
}
