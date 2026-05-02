import dotenv from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_API_BASE: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_KEY: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string().optional()
});

let parsedEnv: z.infer<typeof envSchema> | null = null;

export function loadEnvironment() {
  const result = envSchema.safeParse({
    ...(dotenv.config().parsed ?? process.env)
  });

  if (!result.success) {
    console.error('Environment validation failed:', result.error.format());
    throw new Error('Invalid environment variables');
  }

  parsedEnv = result.data;
  return parsedEnv;
}

export function getConfig() {
  if (!parsedEnv) {
    return loadEnvironment();
  }
  return parsedEnv;
}
