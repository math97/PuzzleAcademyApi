import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  RIOT_REGION: z.enum(['BR1', 'EUN1', 'EUW1']),
  RIOT_API_KEY: z.string(),
  RIOT_URL: z.enum([
    'americas.api.riotgames.com',
    'europe.api.riotgames.com',
  ]),
});

export type Env = z.infer<typeof envSchema>;
