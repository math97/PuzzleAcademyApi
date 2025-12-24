import { LoadPlayerStatsUseCase } from './load-player-stats';
import { RiotApiGateway } from '../gateways/riot-api-gateway';
import { Player } from '@/domain/league/enterprise/entities/player';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InMemoryPlayersRepository } from 'test/repositories/in-memory-players-repository';
import { InMemorySnapshotRepository } from 'test/repositories/in-memory-snapshot-repository';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';

describe('LoadPlayerStatsUseCase', () => {
  let sut: LoadPlayerStatsUseCase;
  let playersRepository: InMemoryPlayersRepository;
  let riotApiGateway: RiotApiGateway;
  let snapshotRepository: InMemorySnapshotRepository;

  beforeEach(() => {
    playersRepository = new InMemoryPlayersRepository();
    snapshotRepository = new InMemorySnapshotRepository();
    riotApiGateway = {
      getLeagueEntries: vi.fn(),
    } as any;

    sut = new LoadPlayerStatsUseCase(
      playersRepository,
      riotApiGateway,
      snapshotRepository,
    );
  });

  it('should save snapshot if no snapshot exists for today', async () => {
    const player = Player.create(
      {
        name: 'test',
        tag: 'test',
        riotPuiid: 'puuid',
      },
      new UniqueEntityId('player-id'),
    );
    await playersRepository.insert(player);

    (riotApiGateway.getLeagueEntries as Mock).mockResolvedValue([
      {
        queueType: 'RANKED_SOLO_5x5',
        tier: 'GOLD',
        rank: 'IV',
        leaguePoints: 10,
        wins: 20,
        losses: 10,
        hotStreak: false,
      },
    ]);

    await sut.execute({ playerId: 'player-id' });

    expect(snapshotRepository.items).toHaveLength(1);
    expect(snapshotRepository.items[0].queueType).toBe('RANKED_SOLO_5x5');
  });

  it('should NOT save snapshot if snapshot exists for today and no diff', async () => {
    const player = Player.create(
      {
        name: 'test',
        tag: 'test',
        riotPuiid: 'puuid',
      },
      new UniqueEntityId('player-id'),
    );
    await playersRepository.insert(player);

    const snapshot = Snapshot.create({
      playerId: 'player-id',
      queueType: 'RANKED_SOLO_5x5',
      tier: 'GOLD',
      rank: 'IV',
      leaguePoints: 10,
      wins: 20,
      losses: 10,
      hotStreak: false,
      totalPoints: 100, // Dummy value
      createdAt: new Date(),
    });
    await snapshotRepository.create(snapshot);

    (riotApiGateway.getLeagueEntries as Mock).mockResolvedValue([
      {
        queueType: 'RANKED_SOLO_5x5',
        tier: 'GOLD',
        rank: 'IV',
        leaguePoints: 10,
        wins: 20,
        losses: 10,
        hotStreak: false,
      },
    ]);

    await sut.execute({ playerId: 'player-id' });

    expect(snapshotRepository.items).toHaveLength(1);
  });

  it('should save snapshot if snapshot exists for today BUT there is a diff', async () => {
    const player = Player.create(
      {
        name: 'test',
        tag: 'test',
        riotPuiid: 'puuid',
      },
      new UniqueEntityId('player-id'),
    );
    await playersRepository.insert(player);

    const snapshot = Snapshot.create({
      playerId: 'player-id',
      queueType: 'RANKED_SOLO_5x5',
      tier: 'GOLD',
      rank: 'IV',
      leaguePoints: 10,
      wins: 20,
      losses: 10,
      hotStreak: false,
      totalPoints: 100,
      createdAt: new Date(),
    });
    await snapshotRepository.create(snapshot);

    // Changed LP to 15
    (riotApiGateway.getLeagueEntries as Mock).mockResolvedValue([
      {
        queueType: 'RANKED_SOLO_5x5',
        tier: 'GOLD',
        rank: 'IV',
        leaguePoints: 15,
        wins: 20,
        losses: 10,
        hotStreak: false,
      },
    ]);

    await sut.execute({ playerId: 'player-id' });

    expect(snapshotRepository.items).toHaveLength(2);
    expect(snapshotRepository.items[1].leaguePoints).toBe(15);
  });
});
