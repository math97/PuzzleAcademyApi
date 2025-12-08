import { FetchAllPlayersUseCase } from './fetch-all-players';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { InMemorySnapshotRepository } from 'test/repositories/in-memory-snapshot-repository';
import { makePlayer } from 'test/factories/player-factory';
import { makeSnapshot } from 'test/factories/snapshot-factory';

let inMemoryPlayersRepository: InMemoryPlayersRepository;
let inMemorySnapshotRepository: InMemorySnapshotRepository;
let sut: FetchAllPlayersUseCase;

describe('Fetch All Players', () => {
    beforeEach(() => {
        inMemoryPlayersRepository = new InMemoryPlayersRepository();
        inMemorySnapshotRepository = new InMemorySnapshotRepository();
        sut = new FetchAllPlayersUseCase(inMemoryPlayersRepository, inMemorySnapshotRepository);
    });

    it('should be able to fetch paginated players with stats', async () => {
        for (let i = 1; i <= 22; i++) {
            const player = makePlayer({
                name: `Player ${i}`,
                riotPuiid: `puuid-${i}`,
            });
            await inMemoryPlayersRepository.insert(player);

            // Add snapshots for Player 11
            if (i === 11) {
                await inMemorySnapshotRepository.create(makeSnapshot({
                    playerId: player.id.toString(),
                    totalPoints: 100,
                    createdAt: new Date('2023-10-01T10:00:00Z'),
                }));
                await inMemorySnapshotRepository.create(makeSnapshot({
                    playerId: player.id.toString(),
                    totalPoints: 140,
                    createdAt: new Date('2023-10-01T14:00:00Z'),
                }));
            }
        }

        const result = await sut.execute({
            page: 2,
            limit: 10,
            from: new Date('2023-10-01T00:00:00Z'),
            to: new Date('2023-10-01T23:59:59Z'),
        });

        expect(result.data).toHaveLength(10);
        expect(result.meta.total).toBe(22);
        expect(result.meta.page).toBe(2);
        expect(result.meta.lastPage).toBe(3);

        const player11 = result.data.find(d => d.player.name === 'Player 11');
        expect(player11).toBeTruthy();
        expect(player11?.stats.pointsLostOrWon).toBe(40);
        expect(player11?.snapshots).toHaveLength(2);
    });

    it('should be able to fetch empty list', async () => {
        const result = await sut.execute({
            page: 1,
            limit: 10,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });
});
