import { LoadPlayerStatsUseCase } from './load-player-stats';
import { PlayersRepository } from '../repositories/players-repository';
import { RiotApiGateway } from '../gateways/riot-api-gateway';
import { SnapshotRepository } from '../repositories/snapshot-repository';
import { Player } from '@/domain/league/enterprise/entities/player';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';

describe('LoadPlayerStatsUseCase', () => {
  let sut: LoadPlayerStatsUseCase;
  let playersRepository: PlayersRepository;
  let riotApiGateway: RiotApiGateway;
  let snapshotRepository: SnapshotRepository;

  beforeEach(() => {
    playersRepository = {
      findById: vi.fn(),
      save: vi.fn(),
    } as any;
    riotApiGateway = {
      getLeagueEntries: vi.fn(),
    } as any;
    snapshotRepository = {
      create: vi.fn(),
    } as any;

    sut = new LoadPlayerStatsUseCase(
      playersRepository,
      riotApiGateway,
      snapshotRepository,
    );
  });

  it('should load player stats and save snapshot', async () => {
    const player = Player.create(
      {
        name: 'test',
        tag: 'test',
        riotPuiid: 'puuid',
      },
      new UniqueEntityId('player-id'),
    );

    (playersRepository.findById as Mock).mockResolvedValue(player);
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

    const result = await sut.execute({ playerId: 'player-id' });

    expect(result.player).toBeDefined();
    expect(result.snapshots).toHaveLength(1);
    expect(snapshotRepository.create).toHaveBeenCalled();
    expect(playersRepository.save).toHaveBeenCalled();
    expect(player.tier).toBe('GOLD');
    expect(player.rank).toBe('IV');
    expect(player.leaguePoints).toBe(10);
  });
});
