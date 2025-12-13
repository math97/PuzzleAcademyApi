import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { FakeRiotApiGateway } from 'test/gateways/fake-riot-api-gateway';
import { UpdateChampionMasteriesUseCase } from './update-champion-masteries';
import { Player } from '@/domain/league/enterprise/entities/player';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

describe('Update Champion Masteries', () => {
    let playersRepository: InMemoryPlayersRepository;
    let riotApiGateway: FakeRiotApiGateway;
    let sut: UpdateChampionMasteriesUseCase;

    beforeEach(() => {
        playersRepository = new InMemoryPlayersRepository();
        riotApiGateway = new FakeRiotApiGateway();
        sut = new UpdateChampionMasteriesUseCase(playersRepository, riotApiGateway);
    });

    it('should update all 3 champion masteries', async () => {
        const player = Player.create(
            {
                name: 'Player 1',
                tag: 'TAG',
                riotPuiid: 'player-1',
                championMasteries: [
                    { championId: 1, championLevel: 5 },
                    { championId: 2, championLevel: 5 },
                    { championId: 3, championLevel: 5 },
                ],
            },
            new UniqueEntityId('player-1'),
        );
        await playersRepository.insert(player);

        riotApiGateway.masteries = [
            { championId: 4, championLevel: 6 },
            { championId: 5, championLevel: 6 },
            { championId: 6, championLevel: 6 },
        ] as any;

        const result = await sut.execute({
            playerId: 'player-1',
        });

        expect(result.player.championMasteries).toHaveLength(3);
        expect(result.player.championMasteries).toEqual([
            { championId: 4, championLevel: 6 },
            { championId: 5, championLevel: 6 },
            { championId: 6, championLevel: 6 },
        ]);
    });

    it('should update only 1 or 2 matching masteries (partial change)', async () => {
        const player = Player.create(
            {
                name: 'Player 1',
                tag: 'TAG',
                riotPuiid: 'player-1',
                championMasteries: [
                    { championId: 1, championLevel: 5 },
                    { championId: 2, championLevel: 5 },
                    { championId: 3, championLevel: 5 },
                ],
            },
            new UniqueEntityId('player-1'),
        );
        await playersRepository.insert(player);

        riotApiGateway.masteries = [
            { championId: 1, championLevel: 6 }, // Changed level
            { championId: 2, championLevel: 5 }, // Same
            { championId: 7, championLevel: 5 }, // Changed champ
        ] as any;

        const result = await sut.execute({
            playerId: 'player-1',
        });

        expect(result.player.championMasteries).toHaveLength(3);
        expect(result.player.championMasteries).toEqual([
            { championId: 1, championLevel: 6 },
            { championId: 2, championLevel: 5 },
            { championId: 7, championLevel: 5 },
        ]);
    });

    it('should update when player has no previous masteries', async () => {
        const player = Player.create(
            {
                name: 'Player 1',
                tag: 'TAG',
                riotPuiid: 'player-1',
                championMasteries: [],
            },
            new UniqueEntityId('player-1'),
        );
        await playersRepository.insert(player);

        riotApiGateway.masteries = [
            { championId: 1, championLevel: 7 },
            { championId: 2, championLevel: 7 },
            { championId: 3, championLevel: 7 },
        ] as any;

        const result = await sut.execute({
            playerId: 'player-1',
        });

        expect(result.player.championMasteries).toHaveLength(3);
        expect(result.player.championMasteries).toEqual([
            { championId: 1, championLevel: 7 },
            { championId: 2, championLevel: 7 },
            { championId: 3, championLevel: 7 },
        ]);
    });

    it('should update with no changes', async () => {
        const player = Player.create(
            {
                name: 'Player 1',
                tag: 'TAG',
                riotPuiid: 'player-1',
                championMasteries: [
                    { championId: 1, championLevel: 5 },
                    { championId: 2, championLevel: 5 },
                    { championId: 3, championLevel: 5 },
                ],
            },
            new UniqueEntityId('player-1'),
        );
        await playersRepository.insert(player);

        riotApiGateway.masteries = [
            { championId: 1, championLevel: 5 },
            { championId: 2, championLevel: 5 },
            { championId: 3, championLevel: 5 },
        ] as any;

        const result = await sut.execute({
            playerId: 'player-1',
        });

        expect(result.player.championMasteries).toEqual([
            { championId: 1, championLevel: 5 },
            { championId: 2, championLevel: 5 },
            { championId: 3, championLevel: 5 },
        ]);
    });

    it('should throw if player not found', async () => {
        await expect(sut.execute({ playerId: 'fake-id' })).rejects.toBeInstanceOf(
            Error, // NotFoundException
        );
    });
});
