import { Player as PrismaPlayer, Prisma } from '@prisma/client';
import { Player } from '@/domain/league/enterprise/entities/player';
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
    };
  }
}
