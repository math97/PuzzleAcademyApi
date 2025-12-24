import { GetSummonerDetailsUseCase } from './get-summoner-details';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
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
  async getLeagueEntries(puuid: string) {
    if (puuid === 'valid-puuid') {
      return [
        {
          leagueId: 'league-id',
          queueType: 'RANKED_SOLO_5x5',
          tier: 'GOLD',
          rank: 'IV',
          leaguePoints: 50,
          wins: 10,
          losses: 5,
          hotStreak: false,
        },
      ];
    }
    return [];
  }
  async getTopChampionMasteries(puuid: string) {
    return [];
  }
  async getMatchesByPuuid(puuid: string) {
    return [];
  }
  async getMatchDetails(matchId: string) {
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
    expect(inMemoryPlayersRepository.items[0].tier).toBe('GOLD');
    expect(inMemoryPlayersRepository.items[0].rank).toBe('IV');
    expect(inMemoryPlayersRepository.items[0].leaguePoints).toBe(50);
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
