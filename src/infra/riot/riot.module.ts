import { Module } from '@nestjs/common';
import { RiotService } from './riot.service';
import { RiotApiGateway } from '@/domain/league/application/gateways/riot-api-gateway';
import { EnvModule } from '../env/env.module';

@Module({
    imports: [EnvModule],
    providers: [
        {
            provide: RiotApiGateway,
            useClass: RiotService,
        },
        RiotService,
    ],
    exports: [RiotApiGateway],
})
export class RiotModule { }
