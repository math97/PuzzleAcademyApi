import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { PrismaPlayerRepository } from './prisma/repositories/prisma-player-repository';
import { SnapshotRepository } from '@/domain/league/application/repositories/snapshot-repository';
import { PrismaSnapshotRepository } from './prisma/repositories/prisma-snapshot-repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: PlayersRepository,
            useClass: PrismaPlayerRepository,
        },
        {
            provide: SnapshotRepository,
            useClass: PrismaSnapshotRepository,
        },
    ],
    exports: [PrismaService, PlayersRepository, SnapshotRepository],
})
export class DatabaseModule { }
