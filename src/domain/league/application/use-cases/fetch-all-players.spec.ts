import { FetchAllPlayersUseCase } from './fetch-all-players';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { makePlayer } from 'test/factories/player-factory';

let inMemoryPlayersRepository: InMemoryPlayersRepository;
let sut: FetchAllPlayersUseCase;

describe('Fetch All Players', () => {
    beforeEach(() => {
        inMemoryPlayersRepository = new InMemoryPlayersRepository();
        sut = new FetchAllPlayersUseCase(inMemoryPlayersRepository);
    });

    it('should be able to fetch paginated players', async () => {
        for (let i = 1; i <= 22; i++) {
            await inMemoryPlayersRepository.insert(
                makePlayer({
                    name: `Player ${i}`,
                    riotPuiid: `puuid-${i}`,
                }),
            );
        }

        const result = await sut.execute({
            page: 2,
            limit: 10,
        });

        expect(result.data).toHaveLength(10);
        expect(result.meta.total).toBe(22);
        expect(result.meta.page).toBe(2);
        expect(result.meta.lastPage).toBe(3);
        expect(result.data[0].name).toBe('Player 11');
    });

    it('should be able to fetch empty list', async () => {
        const result = await sut.execute({
            page: 1,
            limit: 10,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
    });

    it('should be able to fetch the last page', async () => {
        for (let i = 1; i <= 22; i++) {
            await inMemoryPlayersRepository.insert(
                makePlayer({
                    name: `Player ${i}`,
                    riotPuiid: `puuid-${i}`,
                }),
            );
        }

        const result = await sut.execute({
            page: 3,
            limit: 10,
        });

        expect(result.data).toHaveLength(2);
        expect(result.meta.page).toBe(3);
        expect(result.data[0].name).toBe('Player 21');
    });

    it('should return empty list for non-existent page', async () => {
        for (let i = 1; i <= 22; i++) {
            await inMemoryPlayersRepository.insert(
                makePlayer({
                    name: `Player ${i}`,
                    riotPuiid: `puuid-${i}`,
                }),
            );
        }

        const result = await sut.execute({
            page: 4,
            limit: 10,
        });

        expect(result.data).toHaveLength(0);
        expect(result.meta.page).toBe(4);
    });
});
