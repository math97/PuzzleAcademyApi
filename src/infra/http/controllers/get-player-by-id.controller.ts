import { Controller, Get, Param, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { GetPlayerByIdUseCase } from '@/domain/league/application/use-cases/get-player-by-id';
import { PlayerPresenter } from '../presenters/player-presenter';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('players')
@Controller('/players')
export class GetPlayerByIdController {
    constructor(private getPlayerByIdUseCase: GetPlayerByIdUseCase) { }

    @Get('/:id')
    @ApiOperation({ summary: 'Get player by ID' })
    @ApiParam({ name: 'id', description: 'Player UUID', type: String })
    @ApiResponse({ status: 200, description: 'Player details' })
    @ApiResponse({ status: 404, description: 'Player not found' })
    @ApiResponse({ status: 400, description: 'Invalid UUID' })
    async handle(@Param('id', new ParseUUIDPipe()) id: string) {
        const player = await this.getPlayerByIdUseCase.execute({
            id,
        });

        return {
            data: PlayerPresenter.toHTTP(player),
        };
    }
}
