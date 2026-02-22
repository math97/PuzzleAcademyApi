import { PlayerQueueStatsRepository } from '@/domain/league/application/repositories/player-queue-stats-repository';
import { PlayerQueueStats } from '@/domain/league/enterprise/entities/player-queue-stats';

export class InMemoryPlayerQueueStatsRepository
  implements PlayerQueueStatsRepository
{
  public items: PlayerQueueStats[] = [];

  async upsert(stats: PlayerQueueStats): Promise<void> {
    const index = this.items.findIndex(
      (item) =>
        item.playerId === stats.playerId && item.queueType === stats.queueType,
    );

    if (index >= 0) {
      this.items[index] = stats;
    } else {
      this.items.push(stats);
    }
  }

  async findByPlayerIdAndQueueType(
    playerId: string,
    queueType: string,
  ): Promise<PlayerQueueStats | null> {
    return (
      this.items.find(
        (item) => item.playerId === playerId && item.queueType === queueType,
      ) ?? null
    );
  }

  async findAllByQueueType(queueType: string): Promise<PlayerQueueStats[]> {
    return this.items.filter((item) => item.queueType === queueType);
  }
}
