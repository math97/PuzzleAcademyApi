import { Player } from '@/domain/league/enterprise/entities/player';

export class PlayerStatsPresenter {
  static toHTTP(player: Player) {
    return {
      id: player.id.toString(),
      name: player.name,
      tag: player.tag,
      tier: player.tier,
      rank: player.rank,
      leaguePoints: player.leaguePoints,
      profileIconId: player.profileIconId,
      summonerLevel: player.summonerLevel,
    };
  }
}
