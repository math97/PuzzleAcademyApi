import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { GetSummonerDetailsUseCase } from '@/domain/league/application/use-cases/get-summoner-details';
import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

const getSummonerDetailsQuerySchema = z.object({
    gameName: z.string(),
    tag: z.string(),
});

type GetSummonerDetailsQuerySchema = z.infer<typeof getSummonerDetailsQuerySchema>;

@ApiTags('players')
@Controller('/players/details')
export class GetSummonerDetailsController {
    constructor(private getSummonerDetailsUseCase: GetSummonerDetailsUseCase) { }

    @Get()
    @ApiOperation({ summary: 'Get summoner details from Riot API and update player' })
    @ApiQuery({ name: 'gameName', required: true, type: String, description: 'The game name of the player' })
    @ApiQuery({ name: 'tag', required: true, type: String, description: 'The tag line of the player' })
    @ApiResponse({ status: 200, description: 'Player details updated successfully' })
    @ApiResponse({ status: 404, description: 'Player not found' })
    async handle(
        @Query(new ZodValidationPipe(getSummonerDetailsQuerySchema)) query: GetSummonerDetailsQuerySchema,
    ) {
        const { gameName, tag } = query;

        try {
            await this.getSummonerDetailsUseCase.execute({
                gameName,
                tag,
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }
}
