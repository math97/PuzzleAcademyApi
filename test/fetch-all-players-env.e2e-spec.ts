import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { EnvService } from '@/infra/env/env.service';
import { EnvModule } from '@/infra/env/env.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('Fetch All Players (E2E)', () => {
  let app: INestApplication;
  let envService: EnvService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, EnvModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    envService = app.get(EnvService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should use SEASON_START_DATE when from param is missing', async () => {
    const seasonStartDate = '2025-08-27';
    vi.spyOn(envService, 'get').mockImplementation((key: string) => {
      if (key === 'SEASON_START_DATE') {
        return seasonStartDate as any;
      }
      return undefined as any;
    });

    const response = await request(app.getHttpServer())
      .get('/players')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
  });

  test('should override SEASON_START_DATE when from param is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/players?from=2024-01-01')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
