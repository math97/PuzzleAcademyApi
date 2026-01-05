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
            const match = await this.matchesRepository.findByRiotMatchId(matchId);

            if (match) {
                // Match exists. Check if current player is participating.
                const existingParticipant = match.participants.find(p => p.puuid === player.riotPuiid);

                if (existingParticipant) {
                    // Already processed for this player.
                    return match;
                }

                // Match exists but player is not linked (or we need to update).
                try {
                    const matchDetails = await this.riotApiGateway.getMatchDetails(matchId);
                    const newParticipantDto = matchDetails.info.participants.find((p: any) => p.puuid === player.riotPuiid);

                    if (!newParticipantDto) {
                        return null;
                    }

                    const newParticipant = MatchParticipant.create({
                        puuid: newParticipantDto.puuid,
                        summonerName: newParticipantDto.riotIdGameName || newParticipantDto.summonerName,
                        championName: newParticipantDto.championName,
                        kills: newParticipantDto.kills,
                        deaths: newParticipantDto.deaths,
                        assists: newParticipantDto.assists,
                        win: newParticipantDto.win,
                        totalDamageDealt: newParticipantDto.totalDamageDealt,
                        visionScore: newParticipantDto.visionScore,
                    });

                    // Add to match entity
                    match.addParticipant(newParticipant);

                    await this.matchesRepository.save(match);
                    return match;
                } catch (error) {
                    console.error(`Failed to update match ${matchId} for player ${player.id}`, error);
                    return null;
                }
            }

            // Match does not exist. Create it.
            try {
                const matchDetails = await this.riotApiGateway.getMatchDetails(matchId);

                const participantDto = matchDetails.info.participants.find((p: any) => p.puuid === player.riotPuiid);

                if (!participantDto) {
                    return null;
                }

                const participantsToSave = [
                    MatchParticipant.create({
                        puuid: participantDto.puuid,
                        summonerName: participantDto.riotIdGameName || participantDto.summonerName,
                        championName: participantDto.championName,
                        kills: participantDto.kills,
                        deaths: participantDto.deaths,
                        assists: participantDto.assists,
                        win: participantDto.win,
                        totalDamageDealt: participantDto.totalDamageDealt,
                        visionScore: participantDto.visionScore,
                    })
                ];

                const newMatch = Match.create({
                    riotMatchId: matchId,
                    gameCreation: new Date(matchDetails.info.gameCreation),
                    gameDuration: matchDetails.info.gameDuration,
                    gameMode: matchDetails.info.gameMode,
                    participants: participantsToSave,
                });

                await this.matchesRepository.create(newMatch);
                return newMatch;

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
