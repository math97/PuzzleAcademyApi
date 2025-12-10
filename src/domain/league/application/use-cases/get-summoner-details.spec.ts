import { GetSummonerDetailsUseCase } from './get-summoner-details';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { Player } from '@/domain/league/enterprise/entities/player';
import { makePlayer } from 'test/factories/player-factory';
import { RiotApiGateway } from '../gateways/riot-api-gateway';
import { NotFoundException } from '@nestjs/common';

class FakeRiotApiGateway implements RiotApiGateway {
  async getSummoner(name: string, tag: string) {
    return null;
  }
  async getSummonerDetails(puuid: string) {
    if (puuid === 'valid-puuid') {
      return {
        profileIconId: 1234,
        summonerLevel: 100,
      };
    }
    return null;
  }
}

let inMemoryPlayersRepository: InMemoryPlayersRepository;
let fakeRiotApiGateway: FakeRiotApiGateway;
let sut: GetSummonerDetailsUseCase;

describe('Get Summoner Details', () => {
  beforeEach(() => {
    inMemoryPlayersRepository = new InMemoryPlayersRepository();
    fakeRiotApiGateway = new FakeRiotApiGateway();
    sut = new GetSummonerDetailsUseCase(
      inMemoryPlayersRepository,
      fakeRiotApiGateway,
    );
  });

  it('should be able to get summoner details', async () => {
    const player = makePlayer({
      name: 'Test',
      tag: 'BR1',
      riotPuiid: 'valid-puuid',
    });
    await inMemoryPlayersRepository.insert(player);

    const result = await sut.execute({
      gameName: 'Test',
      tag: 'BR1',
    });

    expect(result).toBeTruthy();
    expect(inMemoryPlayersRepository.items[0].summonerLevel).toBe(100);
    expect(inMemoryPlayersRepository.items[0].profileIconId).toBe(1234);
  });

  it('should not be able to get details of a non-existent player', async () => {
    await expect(
      sut.execute({
        gameName: 'Unknown',
        tag: 'User',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
