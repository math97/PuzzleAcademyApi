import { Controller, Get, Query } from '@nestjs/common';
import { FetchAllPlayersUseCase } from '@/domain/league/application/use-cases/fetch-all-players';
import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { PlayerPresenter } from '../presenters/player-presenter';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

const pageQueryParamSchema = z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1));

const limitQueryParamSchema = z
    .string()
    .optional()
    .default('20')
    .transform(Number)
    .pipe(z.number().min(1).max(100));

const querySchema = z.object({
    page: pageQueryParamSchema,
    limit: limitQueryParamSchema,
});

type QuerySchema = z.infer<typeof querySchema>;

@ApiTags('players')
@Controller('/players')
export class FetchAllPlayersController {
    constructor(private fetchAllPlayersUseCase: FetchAllPlayersUseCase) { }

    @Get()
    @ApiOperation({ summary: 'Fetch all players with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
    @ApiResponse({ status: 200, description: 'Paginated list of players' })
    async handle(
        @Query(new ZodValidationPipe(querySchema)) query: QuerySchema,
    ) {
        const { page, limit } = query;

        const result = await this.fetchAllPlayersUseCase.execute({
            page,
            limit,
        });

        return {
            data: result.data.map(PlayerPresenter.toHTTP),
            meta: result.meta,
        };
    }
}
