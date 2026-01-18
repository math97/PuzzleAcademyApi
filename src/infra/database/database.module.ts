import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PlayersRepository } from '@/domain/league/application/repositories/players-repository';
import { PrismaPlayerRepository } from './prisma/repositories/prisma-player-repository';
import { SnapshotRepository } from '@/domain/league/application/repositories/snapshot-repository';
import { PrismaSnapshotRepository } from './prisma/repositories/prisma-snapshot-repository';
import { MatchesRepository } from '@/domain/league/application/repositories/matches-repository';
import { PrismaMatchesRepository } from './prisma/repositories/prisma-matches-repository';

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
    {
      provide: MatchesRepository,
      useClass: PrismaMatchesRepository,
    },
  ],
  exports: [
    PlayersRepository,
    SnapshotRepository,
    MatchesRepository,
    PrismaService,
  ],
})
export class DatabaseModule {}
