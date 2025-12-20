import { Injectable } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { RiotApiGateway } from '../gateways/riot-api-gateway';
import { MatchesRepository } from '../repositories/matches-repository';
import { Match } from '@/domain/league/enterprise/entities/match';
import { MatchParticipant } from '@/domain/league/enterprise/entities/match-participant';

interface LoadPlayerMatchesUseCaseRequest {
    playerId: string;
    startTime?: number;
    endTime?: number;
}

interface LoadPlayerMatchesUseCaseResponse {
    matches: Match[];
}

@Injectable()
export class LoadPlayerMatchesUseCase {
    constructor(
        private playersRepository: PlayersRepository,
        private riotApiGateway: RiotApiGateway,
        private matchesRepository: MatchesRepository,
    ) { }

    async execute({
        playerId,
        startTime,
        endTime,
    }: LoadPlayerMatchesUseCaseRequest): Promise<LoadPlayerMatchesUseCaseResponse> {
        const player = await this.playersRepository.findById(playerId);

        if (!player) {
            throw new Error('Player not found');
        }

        const matchIds = await this.riotApiGateway.getMatchesByPuuid(
            player.riotPuiid,
            startTime,
            endTime,
        );

        const matchPromises = matchIds.map(async (matchId) => {
            const existingMatch = await this.matchesRepository.findByRiotMatchId(matchId);
            if (existingMatch) {
                return existingMatch;
            }

            try {
                const matchDetails = await this.riotApiGateway.getMatchDetails(matchId);

                const participantdtos = matchDetails.info.participants;

                const validParticipants = participantdtos.filter((p: any) => p.puuid === player.riotPuiid);

                if (validParticipants.length === 0) {
                    return null;
                }

                const participantsToSave = validParticipants.map((p: any) =>
                    MatchParticipant.create({
                        puuid: p.puuid,
                        summonerName: p.riotIdGameName || p.summonerName,
                        championName: p.championName,
                        kills: p.kills,
                        deaths: p.deaths,
                        assists: p.assists,
                        win: p.win,
                        totalDamageDealt: p.totalDamageDealt,
                        visionScore: p.visionScore,
                    })
                );

                const match = Match.create({
                    riotMatchId: matchId,
                    gameCreation: new Date(matchDetails.info.gameCreation),
                    gameDuration: matchDetails.info.gameDuration,
                    gameMode: matchDetails.info.gameMode,
                    participants: participantsToSave,
                });

                await this.matchesRepository.create(match);
                return match;

            } catch (error) {
                console.error(`Failed to process match ${matchId}`, error);
                return null;
            }
        });

        const matches = (await Promise.all(matchPromises)).filter((m): m is Match => m !== null);

        const allPlayerMatches = await this.matchesRepository.findManyByPlayerId(player.id.toString());

        const playerStatsFromMatches = allPlayerMatches.map(m => {
            return m.participants.find(p => p.puuid === player.riotPuiid);
        }).filter((p): p is MatchParticipant => !!p);

        player.updateAggregatedStats(playerStatsFromMatches);
        await this.playersRepository.save(player);

        return {
            matches,
        };
    }
}
