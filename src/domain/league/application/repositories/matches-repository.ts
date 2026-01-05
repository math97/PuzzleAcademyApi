import { Match } from '../../enterprise/entities/match';

export abstract class MatchesRepository {
    abstract create(match: Match): Promise<void>;
    abstract findByRiotMatchId(riotMatchId: string): Promise<Match | null>;
    abstract findManyByPlayerId(playerId: string): Promise<Match[]>;
    abstract save(match: Match): Promise<void>;
}
