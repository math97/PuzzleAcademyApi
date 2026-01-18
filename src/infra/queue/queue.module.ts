import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { EnvService } from '../env/env.service';
import { EnvModule } from '../env/env.module';
import { MatchLoadingProducer } from './producers/match-loading.producer';
import { MatchLoadingConsumer } from './consumers/match-loading.consumer';
import { LoadPlayerMatchesUseCase } from '@/domain/league/application/use-cases/load-player-matches';
import { DatabaseModule } from '../database/database.module';
import { RiotModule } from '../riot/riot.module';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        uri: env.get('RABBITMQ_URL'),
        exchanges: [
          { name: 'matches', type: 'direct' },
          { name: 'matches-dlx', type: 'direct' },
        ],
        queues: [
          {
            name: 'load-player-matches',
            options: {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': 'matches-dlx',
                'x-dead-letter-routing-key': 'load-player-matches-dlq',
              },
            },
          },
          {
            name: 'load-player-matches-dlq',
            options: { durable: true },
          },
        ],
        connectionInitOptions: { wait: false },
      }),
    }),
    DatabaseModule,
    RiotModule,
  ],
  providers: [
    MatchLoadingProducer,
    MatchLoadingConsumer,
    LoadPlayerMatchesUseCase,
  ],
  exports: [MatchLoadingProducer],
})
export class QueueModule {}
