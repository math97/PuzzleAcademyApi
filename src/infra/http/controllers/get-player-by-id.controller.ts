import { Controller, Get, Param, NotFoundException, ParseUUIDPipe, Query } from '@nestjs/common';
import { GetPlayerByIdUseCase } from '@/domain/league/application/use-cases/get-player-by-id';
import { PlayerDetailsPresenter } from '../presenters/player-details-presenter';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('players')
@Controller('/players')
export class GetPlayerByIdController {
    constructor(private getPlayerByIdUseCase: GetPlayerByIdUseCase) { }

    @Get('/:id')
    @ApiOperation({ summary: 'Get player by ID' })
    @ApiParam({ name: 'id', description: 'Player UUID', type: String })
    @ApiQuery({ name: 'from', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'to', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Player details', type: PlayerDetailsPresenter })
    @ApiResponse({ status: 404, description: 'Player not found' })
    @ApiResponse({ status: 400, description: 'Invalid UUID' })
    async handle(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const result = await this.getPlayerByIdUseCase.execute({
            id,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });

        return {
            data: PlayerDetailsPresenter.toHTTP(result),
        };
    }
}
