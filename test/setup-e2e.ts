import { PrismaTestEnvironment } from './utils/prisma-test-environment';

const prismaTestEnvironment = new PrismaTestEnvironment();

beforeAll(async () => {
    await prismaTestEnvironment.setup();
});

afterAll(async () => {
    await prismaTestEnvironment.teardown();
});
