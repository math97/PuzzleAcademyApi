import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';

export class PrismaTestEnvironment {
    private schema: string;
    private connectionString: string;
    private prisma: PrismaClient;

    constructor() {
        const dbUrl = process.env.DATABASE_URL;

        if (!dbUrl) {
            throw new Error('DATABASE_URL is not defined');
        }

        this.schema = `test_${randomUUID()}`;
        const url = new URL(dbUrl);
        url.searchParams.set('schema', this.schema);

        this.connectionString = url.toString();
        this.prisma = new PrismaClient({
            datasources: { db: { url: this.connectionString } },
        });
    }

    async setup() {
        process.env.DATABASE_URL = this.connectionString;

        execSync(`npx prisma migrate deploy`, {
            env: { ...process.env, DATABASE_URL: this.connectionString },
        });

        return this.prisma;
    }

    async teardown() {
        await this.prisma.$executeRawUnsafe(
            `DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`,
        );
        await this.prisma.$disconnect();
    }
}
