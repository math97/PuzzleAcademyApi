import { Player } from '@/domain/league/enterprise/entities/player';

export class PlayerPresenter {
  static toHTTP(player: Player) {
    return {
      id: player.id.toString(),
      gameName: player.name,
      tagLine: player.tag,
      puuid: player.riotPuiid,
      profileIconId: player.profileIconId,
      summonerLevel: player.summonerLevel,
      tier: player.tier,
      rank: player.rank,
      leaguePoints: player.leaguePoints,
    };
  }
}
