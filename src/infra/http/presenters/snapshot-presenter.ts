import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';

export class SnapshotPresenter {
    static toHTTP(snapshot: Snapshot) {
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
