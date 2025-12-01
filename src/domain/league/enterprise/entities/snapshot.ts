import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface SnapshotProps {
    playerId: string;
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    hotStreak: boolean;
    totalPoints: number;
    createdAt: Date;
}

export class Snapshot extends Entity<SnapshotProps> {
    get playerId() {
        return this.props.playerId;
    }

    get queueType() {
        return this.props.queueType;
    }

    get tier() {
        return this.props.tier;
    }

    get rank() {
        return this.props.rank;
    }

    get leaguePoints() {
        return this.props.leaguePoints;
    }

    get wins() {
        return this.props.wins;
    }

    get losses() {
        return this.props.losses;
    }

    get hotStreak() {
        return this.props.hotStreak;
    }

    get totalPoints() {
        return this.props.totalPoints;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    static create(
        props: Optional<SnapshotProps, 'createdAt'>,
        id?: UniqueEntityId,
    ) {
        const snapshot = new Snapshot(
            {
                ...props,
                createdAt: props.createdAt ?? new Date(),
            },
            id,
        );

        return snapshot;
    }

    static calculateTotalPoints(tier: string, rank: string): number {
        const tierPoints: Record<string, number> = {
            IRON: 0,
            BRONZE: 400,
            SILVER: 800,
            GOLD: 1200,
            PLATINUM: 1600,
            EMERALD: 2000,
            DIAMOND: 2400,
        };

        const rankPoints: Record<string, number> = {
            IV: 0,
            III: 100,
            II: 200,
            I: 300,
        };

        const tierValue = tierPoints[tier] ?? 0;
        const rankValue = rankPoints[rank] ?? 0;

        return tierValue + rankValue;
    }
}
