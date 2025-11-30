import { Injectable } from '@nestjs/common';
import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { PaginatedResult } from '@/core/repositories/paginated-result';
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

    async save(player: Player): Promise<void> {
        const data = PrismaPlayerMapper.toPrisma(player);

        await this.prisma.player.update({
            where: {
                id: data.id,
            },
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

    async findByNameAndTag(name: string, tag: string): Promise<Player | null> {
        const player = await this.prisma.player.findFirst({
            where: {
                gameName: name,
                tagLine: tag,
            },
        });

        if (!player) {
            return null;
        }

        return PrismaPlayerMapper.toDomain(player);
    }

    async findAll({ page, limit }: PaginationParams): Promise<PaginatedResult<Player>> {
        const [total, players] = await Promise.all([
            this.prisma.player.count(),
            this.prisma.player.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);

        const lastPage = Math.ceil(total / limit);

        return {
            data: players.map(PrismaPlayerMapper.toDomain),
            meta: {
                total,
                page,
                lastPage,
            },
        };
    }
}
