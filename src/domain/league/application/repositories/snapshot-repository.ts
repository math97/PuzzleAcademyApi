import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';

export abstract class SnapshotRepository {
    abstract create(snapshot: Snapshot): Promise<void>;
}
