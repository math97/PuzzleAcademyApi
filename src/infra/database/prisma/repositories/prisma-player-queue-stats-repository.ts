import { Injectable } from '@nestjs/common';
import { PlayerQueueStatsRepository } from '@/domain/league/application/repositories/player-queue-stats-repository';
import { PlayerQueueStats } from '@/domain/league/enterprise/entities/player-queue-stats';
import { PrismaService } from '../prisma.service';
import { PrismaPlayerQueueStatsMapper } from '../mappers/prisma-player-queue-stats-mapper';

@Injectable()
export class PrismaPlayerQueueStatsRepository
  implements PlayerQueueStatsRepository
{
  constructor(private prisma: PrismaService) {}

  async upsert(stats: PlayerQueueStats): Promise<void> {
    await this.prisma.playerQueueStats.upsert({
      where: {
        playerId_queueType: {
          playerId: stats.playerId,
          queueType: stats.queueType,
        },
      },
      create: PrismaPlayerQueueStatsMapper.toPrismaCreate(stats),
      update: {
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
      },
    });
  }

  async findByPlayerIdAndQueueType(
    playerId: string,
    queueType: string,
  ): Promise<PlayerQueueStats | null> {
    const stats = await this.prisma.playerQueueStats.findUnique({
      where: {
        playerId_queueType: {
          playerId,
          queueType,
        },
      },
    });

    if (!stats) {
      return null;
    }

    return PrismaPlayerQueueStatsMapper.toDomain(stats);
  }

  async findAllByQueueType(queueType: string): Promise<PlayerQueueStats[]> {
    const statsList = await this.prisma.playerQueueStats.findMany({
      where: { queueType },
    });

    return statsList.map(PrismaPlayerQueueStatsMapper.toDomain);
  }
}
