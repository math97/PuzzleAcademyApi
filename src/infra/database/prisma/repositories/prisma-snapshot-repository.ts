import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SnapshotRepository } from '@/domain/league/application/repositories/snapshot-repository';
import { Snapshot } from '@/domain/league/enterprise/entities/snapshot';
import { PrismaSnapshotMapper } from '../mappers/prisma-snapshot-mapper';

@Injectable()
export class PrismaSnapshotRepository implements SnapshotRepository {
    constructor(private prisma: PrismaService) { }

    async create(snapshot: Snapshot): Promise<void> {
        const data = PrismaSnapshotMapper.toPrisma(snapshot);

        await this.prisma.snapshot.create({
            data,
        });
    }
}
