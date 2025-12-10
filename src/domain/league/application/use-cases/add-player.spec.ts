import { ConflictException, NotFoundException } from '@nestjs/common';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { AddPlayerUseCase } from './add-player';
import { RiotApiGateway } from '../gateways/riot-api-gateway';

describe('Add Player', () => {
  let inMemoryPlayersRepository: InMemoryPlayersRepository;
  let riotApiGateway: RiotApiGateway;
  let sut: AddPlayerUseCase;

  beforeEach(() => {
    inMemoryPlayersRepository = new InMemoryPlayersRepository();
    riotApiGateway = {
      getSummoner: vi.fn().mockResolvedValue({
        puuid: 'any_puuid',
        gameName: 'any_name',
        tagLine: 'any_tag',
      }),
      getSummonerDetails: vi.fn(),
      getLeagueEntries: vi.fn(),
    };
    sut = new AddPlayerUseCase(inMemoryPlayersRepository, riotApiGateway);
  });

  it('should be able to add a new player', async () => {
    const { player } = await sut.execute({
      name: 'any_name',
      tag: 'any_tag',
    });

    expect(player.id).toBeTruthy();
    expect(inMemoryPlayersRepository.items[0]).toEqual(player);
  });

  it('should not be able to add a player that already exists', async () => {
    const { player } = await sut.execute({
      name: 'any_name',
      tag: 'any_tag',
    });

    await expect(
      sut.execute({
        name: 'any_name',
        tag: 'any_tag',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should not be able to add a player that does not exist on Riot', async () => {
    riotApiGateway.getSummoner = vi.fn().mockResolvedValue(null);

    await expect(
      sut.execute({
        name: 'invalid_name',
        tag: 'invalid_tag',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
