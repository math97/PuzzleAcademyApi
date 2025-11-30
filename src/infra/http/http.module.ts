import { Module } from '@nestjs/common';
import { CreatePlayerController } from './controllers/create-player.controller';
import { AddPlayerUseCase } from '@/domain/league/application/use-cases/add-player';
import { DatabaseModule } from '../database/database.module';
import { RiotModule } from '../riot/riot.module';

@Module({
    imports: [DatabaseModule, RiotModule],
    controllers: [CreatePlayerController],
    providers: [AddPlayerUseCase],
})
export class HttpModule { }
