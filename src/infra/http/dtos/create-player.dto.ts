import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createPlayerBodySchema = z.object({
    gameName: z.string(),
    tagLine: z.string(),
});

export class CreatePlayerDto extends createZodDto(createPlayerBodySchema) { }
