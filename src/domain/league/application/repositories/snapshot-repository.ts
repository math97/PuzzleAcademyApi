import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';

export abstract class SnapshotRepository {
  abstract create(snapshot: Snapshot): Promise<void>;
  abstract findByPlayerIdAndDateRange(
    playerId: string,
    from: Date,
    to: Date,
  ): Promise<Snapshot[]>;
  abstract findFirstByPlayerId(playerId: string): Promise<Snapshot | null>;
}
