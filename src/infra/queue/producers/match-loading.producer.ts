import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export interface LoadMatchesJobPayload {
  playerId: string;
  startTime?: number;
  endTime?: number;
}

@Injectable()
export class MatchLoadingProducer {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishLoadMatchesJob(payload: LoadMatchesJobPayload): Promise<void> {
    await this.amqpConnection.publish(
      'matches',
      'load-player-matches',
      payload,
    );
  }

  async publishBatchLoadMatchesJobs(
    playerIds: string[],
    startTime?: number,
    endTime?: number,
  ): Promise<void> {
    for (const playerId of playerIds) {
      await this.publishLoadMatchesJob({ playerId, startTime, endTime });
    }
  }
}
