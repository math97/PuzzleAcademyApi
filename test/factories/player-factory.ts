import { Player, PlayerProps } from '@/domain/league/enterprise/entities/player';
import { PrismaPlayerMapper } from '@/infra/database/prisma/mappers/prisma-player-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export function makePlayer(
    override: Partial<PlayerProps> = {},
    id?: UniqueEntityId,
) {
    const player = Player.create(
        {
            name: 'John Doe',
            tag: 'BR1',
            riotPuiid: 'fake-puuid',
            ...override,
        },
        id,
    );

    return player;
}

@Injectable()
export class PlayerFactory {
    constructor(private prisma: PrismaService) { }

    async makePrismaPlayer(data: Partial<PlayerProps> = {}): Promise<Player> {
        const player = makePlayer(data);

        await this.prisma.player.create({
            data: PrismaPlayerMapper.toPrisma(player),
        });

        return player;
    }
}
