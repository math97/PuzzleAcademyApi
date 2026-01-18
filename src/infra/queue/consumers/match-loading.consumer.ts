import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { LoadPlayerMatchesUseCase } from '@/domain/league/application/use-cases/load-player-matches';
import { LoadMatchesJobPayload } from '../producers/match-loading.producer';

@Injectable()
export class MatchLoadingConsumer {
  private readonly logger = new Logger(MatchLoadingConsumer.name);

  constructor(private loadPlayerMatchesUseCase: LoadPlayerMatchesUseCase) {}

  @RabbitSubscribe({
    exchange: 'matches',
    routingKey: 'load-player-matches',
    queue: 'load-player-matches',
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'matches-dlx',
        'x-dead-letter-routing-key': 'load-player-matches-dlq',
      },
    },
  })
  async handleLoadMatches(
    payload: LoadMatchesJobPayload,
  ): Promise<void | Nack> {
    this.logger.log(`Processing match load job for player ${payload.playerId}`);

    try {
      const result = await this.loadPlayerMatchesUseCase.execute({
        playerId: payload.playerId,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });

      this.logger.log(
        `Successfully loaded ${result.matches.length} matches for player ${payload.playerId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to load matches for player ${payload.playerId}:`,
        error instanceof Error ? error.message : error,
      );

      // Return Nack to reject the message and send to DLQ
      return new Nack(false);
    }
  }
}
