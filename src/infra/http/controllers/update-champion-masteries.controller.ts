import { Controller, Patch, Param, NotFoundException } from '@nestjs/common';
import { UpdateChampionMasteriesUseCase } from '@/domain/league/application/use-cases/update-champion-masteries';
import { PlayerPresenter } from '../presenters/player-presenter';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('players')
@Controller('/players/:id/masteries')
export class UpdateChampionMasteriesController {
    constructor(
        private updateChampionMasteriesUseCase: UpdateChampionMasteriesUseCase,
    ) { }

    @Patch()
    @ApiOperation({
        summary: 'Update top 3 champion masteries for a player',
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The ID of the player',
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: 'Player masteries updated successfully',
    })
    @ApiResponse({ status: 404, description: 'Player not found' })
    async handle(@Param('id') playerId: string) {
        try {
            const { player } = await this.updateChampionMasteriesUseCase.execute({
                playerId,
            });

            return {
                data: PlayerPresenter.toHTTP(player),
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }
}
