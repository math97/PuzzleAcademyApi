import { PlayerQueueStats } from '@/domain/league/enterprise/entities/player-queue-stats';

export abstract class PlayerQueueStatsRepository {
  abstract upsert(stats: PlayerQueueStats): Promise<void>;
  abstract findByPlayerIdAndQueueType(
    playerId: string,
    queueType: string,
  ): Promise<PlayerQueueStats | null>;
  abstract findAllByQueueType(queueType: string): Promise<PlayerQueueStats[]>;
}
