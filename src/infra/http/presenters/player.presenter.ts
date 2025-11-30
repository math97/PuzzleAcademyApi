import { Player } from '@/domain/league/enterprise/entities/player';
import { PlayerResponseDto } from '../dtos/player-response.dto';

export class PlayerPresenter {
    static toHTTP(player: Player): PlayerResponseDto {
        return {
            id: player.id.toString(),
            gameName: player.name,
            tagLine: player.tag,
            puuid: player.riotPuiid,
            tier: player.tier ?? null,
            rank: player.rank ?? null,
            leaguePoints: player.leaguePoints ?? null,
            profileIconId: player.profileIconId ?? null,
            summonerLevel: player.summonerLevel ?? null,
        };
    }
}
