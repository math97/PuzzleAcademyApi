import { Injectable } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { PaginatedResult } from '@/core/repositories/paginated-result';
import { Player } from '@/domain/league/enterprise/entities/player';

interface FetchAllPlayersRequest {
    page: number;
    limit: number;
}

@Injectable()
export class FetchAllPlayersUseCase {
    constructor(private playersRepository: PlayersRepository) { }

    async execute({ page, limit }: FetchAllPlayersRequest): Promise<PaginatedResult<Player>> {
        const result = await this.playersRepository.findAll({
            page,
            limit,
        });

        return result;
    }
}
