import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SnapshotRepository } from '@/domain/league/application/repositories/snapshot-repository';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';
import { PrismaSnapshotMapper } from '../mappers/prisma-snapshot-mapper';

@Injectable()
export class PrismaSnapshotRepository implements SnapshotRepository {
  constructor(private prisma: PrismaService) {}

  async create(snapshot: Snapshot): Promise<void> {
    const data = PrismaSnapshotMapper.toPrisma(snapshot);

    await this.prisma.snapshot.create({
      data,
    });
  }

  async findByPlayerIdAndDateRange(
    playerId: string,
    from: Date,
    to: Date,
  ): Promise<Snapshot[]> {
    const snapshots = await this.prisma.snapshot.findMany({
      where: {
        playerId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return snapshots.map(PrismaSnapshotMapper.toDomain);
  }

  async findFirstByPlayerId(playerId: string): Promise<Snapshot | null> {
    const snapshot = await this.prisma.snapshot.findFirst({
      where: {
        playerId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!snapshot) {
      return null;
    }

    return PrismaSnapshotMapper.toDomain(snapshot);
  }
}
