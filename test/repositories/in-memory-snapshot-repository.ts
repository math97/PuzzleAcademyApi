import { SnapshotRepository } from '@/domain/league/application/repositories/snapshot-repository';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';

export class InMemorySnapshotRepository implements SnapshotRepository {
    public items: Snapshot[] = [];

    async create(snapshot: Snapshot): Promise<void> {
        this.items.push(snapshot);
    }

    async findByPlayerIdAndDateRange(playerId: string, from: Date, to: Date): Promise<Snapshot[]> {
        return this.items
            .filter((item) => {
                return (
                    item.playerId === playerId &&
                    item.createdAt >= from &&
                    item.createdAt <= to
                );
            })
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    async findFirstByPlayerId(playerId: string): Promise<Snapshot | null> {
        const snapshots = this.items
            .filter((item) => item.playerId === playerId)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        if (snapshots.length === 0) {
            return null;
        }

        return snapshots[0];
    }
}
