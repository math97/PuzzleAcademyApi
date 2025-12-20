import { Player as PrismaPlayer, Prisma } from '@prisma/client';
import { ChampionMastery, Player } from '@/domain/league/enterprise/entities/player';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export class PrismaPlayerMapper {
  static toDomain(raw: PrismaPlayer): Player {
    return Player.create(
      {
        name: raw.gameName,
        tag: raw.tagLine,
        riotPuiid: raw.puuid,
        summonerLevel: raw.summonerLevel,
        profileIconId: raw.profileIconId,
        tier: raw.tier,
        rank: raw.rank,
        leaguePoints: null,
        championMasteries: raw.championMasteries as unknown as ChampionMastery[],
        stats: {
          totalKills: raw.totalKills,
          totalDeaths: raw.totalDeaths,
          totalAssists: raw.totalAssists,
          bestMatchKda: (raw as any).bestMatchKda ?? 0,
        },
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrisma(player: Player): Prisma.PlayerUncheckedCreateInput {
    return {
      id: player.id.toString(),
      puuid: player.riotPuiid,
      gameName: player.name,
      tagLine: player.tag,
      summonerLevel: player.summonerLevel || 0,
      profileIconId: player.profileIconId || 0,
      tier: player.tier,
      rank: player.rank,
      region: 'BR1',
      championMasteries: player.championMasteries as unknown as Prisma.NullableJsonNullValueInput,
      totalKills: player.stats?.totalKills || 0,
      totalDeaths: player.stats?.totalDeaths || 0,
      totalAssists: player.stats?.totalAssists || 0,
      bestMatchKda: player.stats?.bestMatchKda || 0.0,
    };
  }
}
