import { PlayerQueueStats as PrismaPlayerQueueStats, Prisma } from '@prisma/client';
import { PlayerQueueStats } from '@/domain/league/enterprise/entities/player-queue-stats';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export class PrismaPlayerQueueStatsMapper {
  static toDomain(raw: PrismaPlayerQueueStats): PlayerQueueStats {
    return PlayerQueueStats.create(
      {
        playerId: raw.playerId,
        queueType: raw.queueType,
        totalGames: raw.totalGames,
        totalWins: raw.totalWins,
        totalTop4: raw.totalTop4,
        avgPlacement: raw.avgPlacement,
        totalKills: raw.totalKills,
        totalDeaths: raw.totalDeaths,
        totalAssists: raw.totalAssists,
        bestMatchKda: raw.bestMatchKda,
        totalDamageDealtToChampions: raw.totalDamageDealtToChampions,
        totalDamageTaken: raw.totalDamageTaken,
        totalPentaKills: raw.totalPentaKills,
        bestKillingSpree: raw.bestKillingSpree,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrismaCreate(
    stats: PlayerQueueStats,
  ): Prisma.PlayerQueueStatsUncheckedCreateInput {
    return {
      id: stats.id.toString(),
      playerId: stats.playerId,
      queueType: stats.queueType,
      totalGames: stats.totalGames,
      totalWins: stats.totalWins,
      totalTop4: stats.totalTop4,
      avgPlacement: stats.avgPlacement,
      totalKills: stats.totalKills,
      totalDeaths: stats.totalDeaths,
      totalAssists: stats.totalAssists,
      bestMatchKda: stats.bestMatchKda,
      totalDamageDealtToChampions: stats.totalDamageDealtToChampions,
      totalDamageTaken: stats.totalDamageTaken,
      totalPentaKills: stats.totalPentaKills,
      bestKillingSpree: stats.bestKillingSpree,
    };
  }
}
