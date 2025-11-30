import { Body, ConflictException, Controller, NotFoundException, Post } from '@nestjs/common';
import { AddPlayerUseCase } from '@/domain/league/application/use-cases/add-player';
import { PlayerPresenter } from '../presenters/player.presenter';
import { z } from 'zod';

const createPlayerBodySchema = z.object({
    gameName: z.string(),
    tagLine: z.string(),
});

type CreatePlayerBodySchema = z.infer<typeof createPlayerBodySchema>;

@Controller('/players')
export class CreatePlayerController {
    constructor(private addPlayer: AddPlayerUseCase) { }

    @Post()
    async handle(@Body() body: CreatePlayerBodySchema) {
        const { gameName, tagLine } = createPlayerBodySchema.parse(body);

        try {
            const { player } = await this.addPlayer.execute({
                name: gameName,
                tag: tagLine,
            });

            return PlayerPresenter.toHTTP(player);
        } catch (error: any) {
            if (error.message === 'Summoner not found') {
                throw new NotFoundException('Summoner not found');
            }

            if (error.message === 'Player already exists') {
                throw new ConflictException('Player already exists');
            }

            throw error;
        }
    }
}
