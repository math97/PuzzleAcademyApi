import { Match } from '@/domain/league/enterprise/entities/match';

export class MatchPresenter {
    static toHTTP(match: Match) {
        return {
            id: match.id.toString(),
            riotMatchId: match.riotMatchId,
            gameCreation: match.gameCreation,
            gameMode: match.gameMode,
            participants: match.participants.map((p) => ({
                summonerName: p.summonerName,
                championName: p.championName,
                kills: p.kills,
                deaths: p.deaths,
                assists: p.assists,
                win: p.win,
            })),
        };
    }
}
