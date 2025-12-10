import { Snapshot as PrismaSnapshot, Prisma } from '@prisma/client';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export class PrismaSnapshotMapper {
  static toDomain(raw: PrismaSnapshot): Snapshot {
    return Snapshot.create(
      {
        playerId: raw.playerId,
        queueType: raw.queueType,
        tier: raw.tier,
        rank: raw.rank,
        leaguePoints: raw.leaguePoints,
        wins: raw.wins,
        losses: raw.losses,
        hotStreak: raw.hotStreak,
        totalPoints: raw.totalPoints,
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrisma(snapshot: Snapshot): Prisma.SnapshotUncheckedCreateInput {
    return {
      id: snapshot.id.toString(),
      playerId: snapshot.playerId,
      queueType: snapshot.queueType,
      tier: snapshot.tier,
      rank: snapshot.rank,
      leaguePoints: snapshot.leaguePoints,
      wins: snapshot.wins,
      losses: snapshot.losses,
      hotStreak: snapshot.hotStreak,
      totalPoints: snapshot.totalPoints,
      createdAt: snapshot.createdAt,
    };
  }
}
