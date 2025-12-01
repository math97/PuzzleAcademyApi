import { LoadAllPlayersStatsUseCase } from './load-all-players-stats';
import { PlayersRepository } from '../repositories/players-repository';
import { LoadPlayerStatsUseCase } from './load-player-stats';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';

describe('LoadAllPlayersStatsUseCase', () => {
    let sut: LoadAllPlayersStatsUseCase;
    let playersRepository: PlayersRepository;
    let loadPlayerStatsUseCase: LoadPlayerStatsUseCase;

    beforeEach(() => {
        playersRepository = {
            findAllIds: vi.fn(),
        } as any;
        loadPlayerStatsUseCase = {
            execute: vi.fn(),
        } as any;

        sut = new LoadAllPlayersStatsUseCase(
            playersRepository,
            loadPlayerStatsUseCase,
        );
    });

    it('should load stats for all players', async () => {
        const playerIds = ['1', '2', '3'];
        (playersRepository.findAllIds as Mock).mockResolvedValue(playerIds);
        (loadPlayerStatsUseCase.execute as Mock).mockResolvedValue(undefined);

        await sut.execute();

        expect(playersRepository.findAllIds).toHaveBeenCalled();
        expect(loadPlayerStatsUseCase.execute).toHaveBeenCalledTimes(3);
        expect(loadPlayerStatsUseCase.execute).toHaveBeenCalledWith({ playerId: '1' });
        expect(loadPlayerStatsUseCase.execute).toHaveBeenCalledWith({ playerId: '2' });
        expect(loadPlayerStatsUseCase.execute).toHaveBeenCalledWith({ playerId: '3' });
    });

    it('should handle errors gracefully', async () => {
        const playerIds = ['1', '2'];
        (playersRepository.findAllIds as Mock).mockResolvedValue(playerIds);
        (loadPlayerStatsUseCase.execute as Mock).mockImplementation(async ({ playerId }) => {
            if (playerId === '1') {
                throw new Error('Failed');
            }
        });

        await sut.execute();

        expect(loadPlayerStatsUseCase.execute).toHaveBeenCalledTimes(2);
        expect(loadPlayerStatsUseCase.execute).toHaveBeenCalledWith({ playerId: '2' });
    });

    it('should respect concurrency limit', async () => {
        const playerIds = Array.from({ length: 10 }, (_, i) => i.toString());
        (playersRepository.findAllIds as Mock).mockResolvedValue(playerIds);

        let concurrentExecutions = 0;
        let maxConcurrentExecutions = 0;

        (loadPlayerStatsUseCase.execute as Mock).mockImplementation(async () => {
            concurrentExecutions++;
            maxConcurrentExecutions = Math.max(maxConcurrentExecutions, concurrentExecutions);
            await new Promise((resolve) => setTimeout(resolve, 10));
            concurrentExecutions--;
        });

        await sut.execute();

        expect(maxConcurrentExecutions).toBeLessThanOrEqual(5);
        expect(loadPlayerStatsUseCase.execute).toHaveBeenCalledTimes(10);
    });
});
