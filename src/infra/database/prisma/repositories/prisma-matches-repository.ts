import { Injectable } from '@nestjs/common';
import { MatchesRepository } from '@/domain/league/application/repositories/matches-repository';
import { Match } from '@/domain/league/enterprise/entities/match';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { MatchParticipant } from '@/domain/league/enterprise/entities/match-participant';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

@Injectable()
export class PrismaMatchesRepository implements MatchesRepository {
    constructor(private prisma: PrismaService) { }

    async create(match: Match): Promise<void> {
        await this.prisma.match.create({
            data: {
                id: match.id.toString(),
                riotMatchId: match.riotMatchId,
                gameCreation: match.gameCreation,
                gameDuration: match.gameDuration,
                gameMode: match.gameMode,
                participants: {
                    create: match.participants.map((participant) => ({
                        id: participant.id.toString(),
                        puuid: participant.puuid,
                        summonerName: participant.summonerName,
                        championName: participant.championName,
                        kills: participant.kills,
                        deaths: participant.deaths,
                        assists: participant.assists,
                        win: participant.win,
                        totalDamageDealt: participant.totalDamageDealt,
                        visionScore: participant.visionScore,
                    })),
                },
            },
        });
    }

    async findByRiotMatchId(riotMatchId: string): Promise<Match | null> {
        const match = await this.prisma.match.findUnique({
            where: {
                riotMatchId,
            },
            include: {
                participants: true,
            },
        });

        if (!match) {
            return null;
        }

        return Match.create(
            {
                riotMatchId: match.riotMatchId,
                gameCreation: match.gameCreation,
                gameDuration: match.gameDuration,
                gameMode: match.gameMode,
                participants: match.participants.map((p) =>
                    MatchParticipant.create(
                        {
                            puuid: p.puuid,
                            summonerName: p.summonerName,
                            championName: p.championName,
                            kills: p.kills,
                            deaths: p.deaths,
                            assists: p.assists,
                            win: p.win,
                            totalDamageDealt: p.totalDamageDealt,
                            visionScore: p.visionScore,
                        },
                        new UniqueEntityId(p.id),
                    ),
                ),
            },
            new UniqueEntityId(match.id),
        );
    }

    async findManyByPlayerId(playerId: string): Promise<Match[]> {
        const player = await this.prisma.player.findUnique({
            where: { id: playerId },
        });

        if (!player) {
            return [];
        }

        const participants = await this.prisma.matchParticipant.findMany({
            where: {
                puuid: player.puuid,
            },
            include: {
                match: {
                    include: {
                        participants: true,
                    },
                },
            },
        });

        return participants.map((p) => {
            const match = p.match;
            return Match.create(
                {
                    riotMatchId: match.riotMatchId,
                    gameCreation: match.gameCreation,
                    gameDuration: match.gameDuration,
                    gameMode: match.gameMode,
                    participants: match.participants.map((mp) =>
                        MatchParticipant.create(
                            {
                                puuid: mp.puuid,
                                summonerName: mp.summonerName,
                                championName: mp.championName,
                                kills: mp.kills,
                                deaths: mp.deaths,
                                assists: mp.assists,
                                win: mp.win,
                                totalDamageDealt: mp.totalDamageDealt,
                                visionScore: mp.visionScore,
                            },
                            new UniqueEntityId(mp.id),
                        ),
                    ),
                },
                new UniqueEntityId(match.id),
            );
        });
    }
}
