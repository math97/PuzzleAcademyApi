import { Injectable, NotFoundException } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { RiotApiGateway } from '../gateways/riot-api-gateway';

interface GetSummonerDetailsRequest {
    gameName: string;
    tag: string;
}

@Injectable()
export class GetSummonerDetailsUseCase {
    constructor(
        private playersRepository: PlayersRepository,
        private riotApiGateway: RiotApiGateway,
    ) { }

    async execute({ gameName, tag }: GetSummonerDetailsRequest): Promise<void> {
        const player = await this.playersRepository.findByNameAndTag(gameName, tag);

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        const details = await this.riotApiGateway.getSummonerDetails(player.riotPuiid);

        if (details) {
            player.updateDetails({
                profileIconId: details.profileIconId,
                summonerLevel: details.summonerLevel,
            });

            await this.playersRepository.save(player);
        }
    }
}
