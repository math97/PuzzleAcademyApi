import { NotFoundException } from '@nestjs/common';
import { GetPlayerByIdUseCase } from './get-player-by-id';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { makePlayer } from 'test/factories/player-factory';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

let inMemoryPlayersRepository: InMemoryPlayersRepository;
let sut: GetPlayerByIdUseCase;

describe('Get Player By ID', () => {
    beforeEach(() => {
        inMemoryPlayersRepository = new InMemoryPlayersRepository();
        sut = new GetPlayerByIdUseCase(inMemoryPlayersRepository);
    });

    it('should be able to get a player by id', async () => {
        const player = makePlayer({}, new UniqueEntityId('player-1'));
        await inMemoryPlayersRepository.insert(player);

        const result = await sut.execute({
            id: 'player-1',
        });

        expect(result).toBeTruthy();
        expect(result.id.toString()).toBe('player-1');
    });

    it('should throw NotFoundException if player does not exist', async () => {
        await expect(sut.execute({
            id: 'non-existent-id',
        })).rejects.toBeInstanceOf(NotFoundException);
    });
});
