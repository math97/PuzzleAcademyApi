import { Body, ConflictException, Controller, NotFoundException, Post } from '@nestjs/common';
import { AddPlayerUseCase } from '@/domain/league/application/use-cases/add-player';
import { PlayerPresenter } from '../presenters/player.presenter';
import { CreatePlayerDto } from '../dtos/create-player.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlayerResponseDto } from '../dtos/player-response.dto';

@ApiTags('players')
@Controller('/players')
export class CreatePlayerController {
    constructor(private addPlayer: AddPlayerUseCase) { }

    @Post()
    @ApiOperation({ summary: 'Create a new player' })
    @ApiResponse({ status: 201, description: 'The player has been successfully created.', type: PlayerResponseDto })
    @ApiResponse({ status: 404, description: 'Summoner not found.' })
    @ApiResponse({ status: 409, description: 'Player already exists.' })
    async handle(@Body() body: CreatePlayerDto) {
        const { gameName, tagLine } = body;

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
