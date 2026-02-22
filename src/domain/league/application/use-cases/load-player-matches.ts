import { Injectable } from '@nestjs/common';
import { PlayersRepository } from '../repositories/players-repository';
import { RiotApiGateway } from '../gateways/riot-api-gateway';
import { MatchesRepository } from '../repositories/matches-repository';
import { PlayerQueueStatsRepository } from '../repositories/player-queue-stats-repository';
import { Match } from '@/domain/league/enterprise/entities/match';
import { MatchParticipant } from '@/domain/league/enterprise/entities/match-participant';
import { PlayerQueueStats } from '@/domain/league/enterprise/entities/player-queue-stats';

const RANKED_SOLO_QUEUE = 420;
const RANKED_FLEX_QUEUE = 440;
const ARENA_QUEUE = 1700;

const RANKED_QUEUE_IDS = new Set([RANKED_SOLO_QUEUE, RANKED_FLEX_QUEUE]);
const ARENA_QUEUE_IDS = new Set([ARENA_QUEUE]);

const BATCH_SIZE = 5;

async function processBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

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
    private playerQueueStatsRepository: PlayerQueueStatsRepository,
  ) {}

  async execute({
    playerId,
    startTime,
    endTime,
  }: LoadPlayerMatchesUseCaseRequest): Promise<LoadPlayerMatchesUseCaseResponse> {
    const player = await this.playersRepository.findById(playerId);

    if (!player) {
      throw new Error('Player not found');
    }

    const [soloQueueMatchIds, flexQueueMatchIds, arenaMatchIds] =
      await Promise.all([
        this.riotApiGateway.getMatchesByPuuid(
          player.riotPuiid,
          startTime,
          endTime,
          RANKED_SOLO_QUEUE,
        ),
        this.riotApiGateway.getMatchesByPuuid(
          player.riotPuiid,
          startTime,
          endTime,
          RANKED_FLEX_QUEUE,
        ),
        this.riotApiGateway.getMatchesByPuuid(
          player.riotPuiid,
          startTime,
          endTime,
          ARENA_QUEUE,
        ),
      ]);

    const matchIds = [
      ...new Set([
        ...soloQueueMatchIds,
        ...flexQueueMatchIds,
        ...arenaMatchIds,
      ]),
    ];

    const processMatch = async (matchId: string): Promise<Match | null> => {
      const match = await this.matchesRepository.findByRiotMatchId(matchId);

      if (match) {
        const existingParticipant = match.participants.find(
          (p) => p.puuid === player.riotPuiid,
        );

        if (existingParticipant) {
          return match;
        }

        try {
          const matchDetails =
            await this.riotApiGateway.getMatchDetails(matchId);
          const newParticipantDto = matchDetails.info.participants.find(
            (p: any) => p.puuid === player.riotPuiid,
          );

          if (!newParticipantDto) {
            return null;
          }

          const newParticipant = MatchParticipant.create({
            puuid: newParticipantDto.puuid,
            summonerName:
              newParticipantDto.riotIdGameName ||
              newParticipantDto.summonerName,
            championName: newParticipantDto.championName,
            kills: newParticipantDto.kills,
            deaths: newParticipantDto.deaths,
            assists: newParticipantDto.assists,
            win: newParticipantDto.win,
            totalDamageDealt: newParticipantDto.totalDamageDealt,
            visionScore: newParticipantDto.visionScore ?? 0,
            placement: newParticipantDto.placement ?? 0,
            totalDamageDealtToChampions:
              newParticipantDto.totalDamageDealtToChampions ?? 0,
            totalDamageTaken: newParticipantDto.totalDamageTaken ?? 0,
            largestKillingSpree: newParticipantDto.largestKillingSpree ?? 0,
            pentaKills: newParticipantDto.pentaKills ?? 0,
          });

          match.addParticipant(newParticipant);
          await this.matchesRepository.save(match);
          return match;
        } catch (error) {
          console.error(
            `Failed to update match ${matchId} for player ${player.id}`,
            error,
          );
          return null;
        }
      }

      try {
        const matchDetails = await this.riotApiGateway.getMatchDetails(matchId);

        const participantDto = matchDetails.info.participants.find(
          (p: any) => p.puuid === player.riotPuiid,
        );

        if (!participantDto) {
          return null;
        }

        const participantsToSave = [
          MatchParticipant.create({
            puuid: participantDto.puuid,
            summonerName:
              participantDto.riotIdGameName || participantDto.summonerName,
            championName: participantDto.championName,
            kills: participantDto.kills,
            deaths: participantDto.deaths,
            assists: participantDto.assists,
            win: participantDto.win,
            totalDamageDealt: participantDto.totalDamageDealt,
            visionScore: participantDto.visionScore ?? 0,
            placement: participantDto.placement ?? 0,
            totalDamageDealtToChampions:
              participantDto.totalDamageDealtToChampions ?? 0,
            totalDamageTaken: participantDto.totalDamageTaken ?? 0,
            largestKillingSpree: participantDto.largestKillingSpree ?? 0,
            pentaKills: participantDto.pentaKills ?? 0,
          }),
        ];

        const newMatch = Match.create({
          riotMatchId: matchId,
          gameCreation: new Date(matchDetails.info.gameCreation),
          gameDuration: matchDetails.info.gameDuration,
          gameMode: matchDetails.info.gameMode,
          queueId: matchDetails.info.queueId,
          participants: participantsToSave,
        });

        await this.matchesRepository.create(newMatch);
        return newMatch;
      } catch (error) {
        console.error(`Failed to process match ${matchId}`, error);
        return null;
      }
    };

    const matchResults = await processBatches(
      matchIds,
      BATCH_SIZE,
      processMatch,
    );
    const matches = matchResults.filter((m): m is Match => m !== null);

    const allPlayerMatches = await this.matchesRepository.findManyByPlayerId(
      player.id.toString(),
    );

    // Update ranked stats
    const rankedParticipants = allPlayerMatches
      .filter((m) => RANKED_QUEUE_IDS.has(m.queueId))
      .map((m) => m.participants.find((p) => p.puuid === player.riotPuiid))
      .filter((p): p is MatchParticipant => !!p);

    player.updateAggregatedStats(rankedParticipants);
    await this.playersRepository.save(player);

    // Aggregate and upsert Arena stats
    const arenaParticipants = allPlayerMatches
      .filter((m) => ARENA_QUEUE_IDS.has(m.queueId))
      .map((m) => m.participants.find((p) => p.puuid === player.riotPuiid))
      .filter((p): p is MatchParticipant => !!p);

    if (arenaParticipants.length > 0) {
      await this.upsertArenaStats(
        player.id.toString(),
        arenaParticipants,
      );
    }

    return { matches };
  }

  private async upsertArenaStats(
    playerId: string,
    participants: MatchParticipant[],
  ): Promise<void> {
    const totalGames = participants.length;
    const totalWins = participants.filter((p) => p.placement === 1).length;
    const totalTop4 = participants.filter((p) => p.placement <= 4).length;
    const avgPlacement =
      participants.reduce((sum, p) => sum + p.placement, 0) / totalGames;
    const totalKills = participants.reduce((sum, p) => sum + p.kills, 0);
    const totalDeaths = participants.reduce((sum, p) => sum + p.deaths, 0);
    const totalAssists = participants.reduce((sum, p) => sum + p.assists, 0);
    const totalDamageDealtToChampions = BigInt(
      participants.reduce(
        (sum, p) => sum + p.totalDamageDealtToChampions,
        0,
      ),
    );
    const totalDamageTaken = BigInt(
      participants.reduce((sum, p) => sum + p.totalDamageTaken, 0),
    );
    const totalPentaKills = participants.reduce(
      (sum, p) => sum + p.pentaKills,
      0,
    );
    const bestKillingSpree = participants.reduce(
      (best, p) => Math.max(best, p.largestKillingSpree),
      0,
    );
    const bestMatchKda = participants.reduce((best, p) => {
      const kda =
        p.deaths === 0
          ? p.kills + p.assists
          : (p.kills + p.assists) / p.deaths;
      return Math.max(best, kda);
    }, 0);

    const arenaStats = PlayerQueueStats.create({
      playerId,
      queueType: 'ARENA',
      totalGames,
      totalWins,
      totalTop4,
      avgPlacement: Number(avgPlacement.toFixed(2)),
      totalKills,
      totalDeaths,
      totalAssists,
      bestMatchKda: Number(bestMatchKda.toFixed(2)),
      totalDamageDealtToChampions,
      totalDamageTaken,
      totalPentaKills,
      bestKillingSpree,
    });

    await this.playerQueueStatsRepository.upsert(arenaStats);
  }
}
