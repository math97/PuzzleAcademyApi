import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { PrismaPlayerRepository } from './prisma/repositories/prisma-player-repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: PlayersRepository,
            useClass: PrismaPlayerRepository,
        },
    ],
    exports: [PrismaService, PlayersRepository],
})
export class DatabaseModule { }
