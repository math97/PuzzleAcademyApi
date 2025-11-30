import { ApiProperty } from '@nestjs/swagger';

export class PlayerResponseDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id!: string;

    @ApiProperty({ example: 'Faker' })
    gameName!: string;

    @ApiProperty({ example: 'KR1' })
    tagLine!: string;

    @ApiProperty({ example: 'some-puuid' })
    puuid!: string;

    @ApiProperty({ example: 'CHALLENGER', nullable: true })
    tier!: string | null;

    @ApiProperty({ example: 'I', nullable: true })
    rank!: string | null;

    @ApiProperty({ example: 100, nullable: true })
    leaguePoints!: number | null;

    @ApiProperty({ example: 1234, nullable: true })
    profileIconId!: number | null;

    @ApiProperty({ example: 500, nullable: true })
    summonerLevel!: number | null;
}
