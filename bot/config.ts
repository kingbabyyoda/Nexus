import { z } from 'zod';

const envSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_BOT_CLIENT_ID: z.string().min(1),
  DISCORD_BOT_SECRET: z.string().min(1),
  APP_URL: z.string().url(),
});

export const botEnv = envSchema.parse({
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_BOT_CLIENT_ID: process.env.DISCORD_BOT_CLIENT_ID,
  DISCORD_BOT_SECRET: process.env.DISCORD_BOT_SECRET,
  APP_URL: process.env.APP_URL,
});
