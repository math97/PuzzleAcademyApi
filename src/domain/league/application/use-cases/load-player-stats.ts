import { Injectable } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { RiotApiGateway } from '../gateways/riot-api-gateway';
import { SnapshotRepository } from '../repositories/snapshot-repository';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';
import { Player } from '@/domain/league/enterprise/entities/player';

interface LoadPlayerStatsUseCaseRequest {
    playerId: string;
}

interface LoadPlayerStatsUseCaseResponse {
    player: Player;
    snapshots: Snapshot[];
}

@Injectable()
export class LoadPlayerStatsUseCase {
    constructor(
        private playersRepository: PlayersRepository,
        private riotApiGateway: RiotApiGateway,
        private snapshotRepository: SnapshotRepository,
    ) { }

    async execute({
        playerId,
    }: LoadPlayerStatsUseCaseRequest): Promise<LoadPlayerStatsUseCaseResponse> {
        const player = await this.playersRepository.findById(playerId);

        if (!player) {
            throw new Error('Player not found');
        }

        const leagueEntries = await this.riotApiGateway.getLeagueEntries(
            player.riotPuiid,
        );

        const snapshots: Snapshot[] = [];

        for (const entry of leagueEntries) {
            if (
                entry.queueType === 'RANKED_SOLO_5x5' ||
                entry.queueType === 'RANKED_FLEX_SR'
            ) {
                const totalPoints = Snapshot.calculateTotalPoints(
                    entry.tier,
                    entry.rank,
                    entry.leaguePoints,
                );

                const snapshot = Snapshot.create({
                    playerId: player.id.toString(),
                    queueType: entry.queueType,
                    tier: entry.tier,
                    rank: entry.rank,
                    leaguePoints: entry.leaguePoints,
                    wins: entry.wins,
                    losses: entry.losses,
                    hotStreak: entry.hotStreak,
                    totalPoints,
                });

                await this.snapshotRepository.create(snapshot);
                snapshots.push(snapshot);

                if (entry.queueType === 'RANKED_SOLO_5x5') {
                    player.updateStats({
                        tier: entry.tier,
                        rank: entry.rank,
                        leaguePoints: entry.leaguePoints,
                    });
                    await this.playersRepository.save(player);
                }
            }
        }

        return {
            player,
            snapshots,
        };
    }
}

