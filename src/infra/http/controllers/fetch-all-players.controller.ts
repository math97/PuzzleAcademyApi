import { Controller, Get, Query } from '@nestjs/common';
import { FetchAllPlayersUseCase } from '@/domain/league/application/use-cases/fetch-all-players';
import { z } from 'zod';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { PlayerDetailsPresenter } from '../presenters/player-details-presenter';
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
    @ApiQuery({ name: 'from', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'to', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Paginated list of players' })
    async handle(
        @Query(new ZodValidationPipe(querySchema)) query: QuerySchema,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const { page, limit } = query;

        const result = await this.fetchAllPlayersUseCase.execute({
            page,
            limit,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });

        return {
            data: result.data.map(PlayerDetailsPresenter.toHTTP),
            meta: result.meta,
        };
    }
}
