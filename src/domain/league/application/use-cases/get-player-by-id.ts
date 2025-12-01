import { Injectable, NotFoundException } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { Player } from '@/domain/league/enterprise/entities/player';

interface GetPlayerByIdRequest {
    id: string;
}

@Injectable()
export class GetPlayerByIdUseCase {
    constructor(private playersRepository: PlayersRepository) { }

    async execute({ id }: GetPlayerByIdRequest): Promise<Player> {
        const player = await this.playersRepository.findById(id);

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        return player;
    }
}
