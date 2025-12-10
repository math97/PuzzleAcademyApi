import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export function makeSnapshot(
  override: Partial<Snapshot> = {},
  id?: UniqueEntityId,
): Snapshot {
  return Snapshot.create(
    {
      playerId: 'player-1',
      tier: 'GOLD',
      rank: 'IV',
      queueType: 'RANKED_SOLO_5x5',
      leaguePoints: 50,
      wins: 10,
      losses: 10,
      hotStreak: false,
      totalPoints: 450,
      createdAt: new Date(),
      ...override,
    },
    id,
  );
}
