import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Player } from '@/domain/league/enterprise/entities/player';
import { PlayersRepository } from '../repositories/players-repository';
import { RiotApiGateway } from '../gateways/riot-api-gateway';

interface UpdateChampionMasteriesUseCaseRequest {
    playerId: string;
}

interface UpdateChampionMasteriesUseCaseResponse {
    player: Player;
}

@Injectable()
export class UpdateChampionMasteriesUseCase {
    constructor(
        private playersRepository: PlayersRepository,
        private riotApiGateway: RiotApiGateway,
    ) { }

    async execute({
        playerId,
    }: UpdateChampionMasteriesUseCaseRequest): Promise<UpdateChampionMasteriesUseCaseResponse> {
        const player = await this.playersRepository.findById(playerId);

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        const masteries = await this.riotApiGateway.getTopChampionMasteries(
            player.riotPuiid,
        );

        player.updateChampionMasteries(
            masteries.map((mastery) => ({
                championId: mastery.championId,
                championLevel: mastery.championLevel,
            })),
        );

        await this.playersRepository.save(player);

        return {
            player,
        };
    }
}
