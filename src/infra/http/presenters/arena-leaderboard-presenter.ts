import { ArenaLeaderboardEntry } from '@/domain/league/application/use-cases/fetch-arena-leaderboard';

export class ArenaLeaderboardPresenter {
  static toHTTP(entry: ArenaLeaderboardEntry) {
    const { stats, player } = entry;

    const winRate =
      stats.totalGames > 0
        ? Number(((stats.totalWins / stats.totalGames) * 100).toFixed(1))
        : 0;

    const top4Rate =
      stats.totalGames > 0
        ? Number(((stats.totalTop4 / stats.totalGames) * 100).toFixed(1))
        : 0;

    const seasonKda =
      stats.totalDeaths > 0
        ? Number(
            ((stats.totalKills + stats.totalAssists) / stats.totalDeaths).toFixed(2),
          )
        : Number((stats.totalKills + stats.totalAssists).toFixed(2));

    const avgDamagePerGame =
      stats.totalGames > 0
        ? Math.round(Number(stats.totalDamageDealtToChampions) / stats.totalGames)
        : 0;

    return {
      playerId: player.id.toString(),
      name: player.name,
      tagLine: player.tag,
      profileIconId: player.profileIconId,
      totalGames: stats.totalGames,
      totalWins: stats.totalWins,
      totalTop4: stats.totalTop4,
      avgPlacement: stats.avgPlacement,
      winRate,
      top4Rate,
      totalKills: stats.totalKills,
      totalDeaths: stats.totalDeaths,
      totalAssists: stats.totalAssists,
      seasonKda,
      bestMatchKda: stats.bestMatchKda,
      avgDamageToChampions: avgDamagePerGame,
      totalPentaKills: stats.totalPentaKills,
      bestKillingSpree: stats.bestKillingSpree,
    };
  }
}
