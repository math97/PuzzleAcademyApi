import { NotFoundException } from '@nestjs/common';
import { GetPlayerByIdUseCase } from './get-player-by-id';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { InMemorySnapshotRepository } from 'test/repositories/in-memory-snapshot-repository';
import { makePlayer } from 'test/factories/player-factory';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { makeSnapshot } from 'test/factories/snapshot-factory';

let inMemoryPlayersRepository: InMemoryPlayersRepository;
let inMemorySnapshotRepository: InMemorySnapshotRepository;
let sut: GetPlayerByIdUseCase;

describe('Get Player By ID', () => {
    beforeEach(() => {
        inMemoryPlayersRepository = new InMemoryPlayersRepository();
        inMemorySnapshotRepository = new InMemorySnapshotRepository();
        sut = new GetPlayerByIdUseCase(inMemoryPlayersRepository, inMemorySnapshotRepository);
    });

    it('should be able to get a player by id', async () => {
        const player = makePlayer({}, new UniqueEntityId('player-1'));
        await inMemoryPlayersRepository.insert(player);

        const result = await sut.execute({
            id: 'player-1',
        });

        expect(result.player).toBeTruthy();
        expect(result.player.id.toString()).toBe('player-1');
    });

    it('should throw NotFoundException if player does not exist', async () => {
        await expect(sut.execute({
            id: 'non-existent-id',
        })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should calculate stats correctly', async () => {
        const player = makePlayer({}, new UniqueEntityId('player-1'));
        await inMemoryPlayersRepository.insert(player);

        const date = new Date('2023-10-01T10:00:00Z');

        // Snapshot 1: 100 points
        await inMemorySnapshotRepository.create(makeSnapshot({
            playerId: 'player-1',
            totalPoints: 100,
            createdAt: new Date('2023-10-01T10:00:00Z'),
        }));

        // Snapshot 2: 120 points (+20) -> Win
        await inMemorySnapshotRepository.create(makeSnapshot({
            playerId: 'player-1',
            totalPoints: 120,
            createdAt: new Date('2023-10-01T11:00:00Z'),
        }));

        // Snapshot 3: 110 points (-10) -> Loss
        await inMemorySnapshotRepository.create(makeSnapshot({
            playerId: 'player-1',
            totalPoints: 110,
            createdAt: new Date('2023-10-01T12:00:00Z'),
        }));

        // Snapshot 4: 130 points (+20) -> Win
        await inMemorySnapshotRepository.create(makeSnapshot({
            playerId: 'player-1',
            totalPoints: 130,
            createdAt: new Date('2023-10-01T13:00:00Z'),
        }));

        // Snapshot 5: 140 points (+10) -> Win
        await inMemorySnapshotRepository.create(makeSnapshot({
            playerId: 'player-1',
            totalPoints: 140,
            createdAt: new Date('2023-10-01T14:00:00Z'),
        }));

        const result = await sut.execute({
            id: 'player-1',
            from: new Date('2023-10-01T00:00:00Z'),
            to: new Date('2023-10-01T23:59:59Z'),
        });

        expect(result.stats.pointsLostOrWon).toBe(40); // 140 - 100
        expect(result.stats.pointsLostOrWonLifetime).toBe(40); // 140 - 100 (first ever is same as first in range here)
    });
});
