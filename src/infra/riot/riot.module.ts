import { Module } from '@nestjs/common';
import { RiotService } from './riot.service';
import { RiotApiGateway } from '@/domain/league/application/gateways/riot-api-gateway';
import { EnvModule } from '../env/env.module';
import { RateLimiter } from '@/domain/league/application/gateways/rate-limiter';
import { BottleneckRateLimiter } from '../rate-limiting/bottleneck-rate-limiter';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: RiotApiGateway,
      useClass: RiotService,
    },
    {
      provide: RateLimiter,
      useClass: BottleneckRateLimiter,
    },
    RiotService,
  ],
  exports: [RiotApiGateway],
})
export class RiotModule {}
