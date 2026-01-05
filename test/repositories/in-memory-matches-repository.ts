import { MatchesRepository } from '@/domain/league/application/repositories/matches-repository';
import { Match } from '@/domain/league/enterprise/entities/match';

export class InMemoryMatchesRepository implements MatchesRepository {
    public items: Match[] = [];

    async create(match: Match): Promise<void> {
        this.items.push(match);
    }

    async findByRiotMatchId(riotMatchId: string): Promise<Match | null> {
        const match = this.items.find((item) => item.riotMatchId === riotMatchId);

        if (!match) {
            return null;
        }

        return match;
    }

    async findManyByPlayerId(playerId: string): Promise<Match[]> {
        // This is tricky because Match entity stores participants not by player ID but by PUUID in ValueObjects implicitly.
        // But the Repository interface implies we can find by Player ID.
        // Assuming we can't easily map PlayerId to PUUID here without context, 
        // OR we just assume the test setup handles it or we filter by checking participants.
        // Wait, the repository implementation in Prisma likely joins tables.
        // In memory, we need to know the PUUID of the player ID.
        // But the method signature only gives playerId.
        // FOR TESTING PURPOSES: We might need to look up player by ID first? 
        // Or simplified: We just won't rely on this method strictly for "finding by ID" unless we mock the connection.
        // Actually, the UseCase uses this: `this.matchesRepository.findManyByPlayerId(player.id.toString())`
        // So we MUST implement it.
        // BUT, `InMemoryMatchesRepository` validates matches.
        // The filtering happens in `LoadPlayerMatchesUseCase` using `p.puuid === player.riotPuiid`.
        // So `findManyByPlayerId` should return matches where the player participated.
        // But we don't know the PUUID here.

        // LIMITATION: In-memory repo cannot easily link PlayerId -> PUUID without access to PlayersRepo.
        // HACK: For the test, we might just return all matches? Or we attach a property?
        // Better: We can iterate all matches and checking if ANY participant matches meaningful criteria? 
        // No, we can't key off PlayerID in `Match` participants directly (it has PUUID).

        // Solution for Test: 
        // 1. Just return all matches. The UseCase filters by PUUID anyway:
        // `const playerStatsFromMatches = allPlayerMatches.map(m => { return m.participants.find(p => p.puuid === player.riotPuiid); })`
        // So if we return *more* matches than needed, the filter by PUUID will handle it (returning undefined for those matches).
        // Then `.filter((p): p is MatchParticipant => !!p)` removes them.
        // So returning ALL items is safe for the `LoadPlayerMatchesUseCase` logic.

        return this.items;
    }

    async save(match: Match): Promise<void> {
        const itemIndex = this.items.findIndex((item) => item.id.equals(match.id));

        if (itemIndex >= 0) {
            // In a real scenario, we would merge participants.
            // For in-memory, we can assume replacing is fine OR we can merge manually.
            // Since `match` entity passed here supposedly has the updated participants list (or we added to it),
            // replacing is correct IF the match object was retrieved, modified, and saved.
            // BUT if `match` is a NEW object representing an existing match with NEW participants added...
            // the `match.participants` might only have the NEW ones.
            // Let's assume we retrieve -> modify -> save.
            this.items[itemIndex] = match;
        } else {
            this.items.push(match);
        }
    }
}
