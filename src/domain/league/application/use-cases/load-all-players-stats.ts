import { Injectable } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { LoadPlayerStatsUseCase } from './load-player-stats';

@Injectable()
export class LoadAllPlayersStatsUseCase {
    constructor(
        private playersRepository: PlayersRepository,
        private loadPlayerStatsUseCase: LoadPlayerStatsUseCase,
    ) { }

    async execute(): Promise<void> {
        const playerIds = await this.playersRepository.findAllIds();
        const concurrencyLimit = 5;
        const results: Promise<void>[] = [];
        const executing: Promise<void>[] = [];

        for (const playerId of playerIds) {
            const player = this.processPlayer(playerId);
            results.push(player);

            const e: Promise<void> = player.then(() => {
                executing.splice(executing.indexOf(e), 1);
            });
            executing.push(e);

            if (executing.length >= concurrencyLimit) {
                await Promise.race(executing);
            }
        }

        await Promise.all(results);
    }

    private async processPlayer(playerId: string): Promise<void> {
        try {
            await this.loadPlayerStatsUseCase.execute({ playerId });
        } catch (error) {
            console.error(`Failed to load stats for player ${playerId}:`, error);
        }
    }
}
