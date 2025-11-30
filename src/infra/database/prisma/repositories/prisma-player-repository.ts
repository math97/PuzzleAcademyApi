import { Injectable } from '@nestjs/common';
import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { Player } from '@/domain/league/enterprise/entities/player';
import { PrismaService } from '../prisma.service';
import { PrismaPlayerMapper } from '../mappers/prisma-player-mapper';

@Injectable()
export class PrismaPlayerRepository implements PlayersRepository {
    constructor(private prisma: PrismaService) { }

    async insert(player: Player): Promise<void> {
        const data = PrismaPlayerMapper.toPrisma(player);

        await this.prisma.player.create({
            data,
        });
    }

    async findByPuuid(puuid: string): Promise<Player | null> {
        const player = await this.prisma.player.findUnique({
            where: {
                puuid,
            },
        });

        if (!player) {
            return null;
        }

        return PrismaPlayerMapper.toDomain(player);
    }
}
