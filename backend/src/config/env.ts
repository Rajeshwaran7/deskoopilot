import dotenv from 'dotenv';
import { z } from 'zod';
import { DEMO_USER_OBJECT_ID } from './constants.js';

const objectId24 = z.string().regex(/^[a-f0-9]{24}$/i, 'Must be a 24-char hex Mongo ObjectId');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1),
  /** Default user for demo / single-tenant until auth ships. */
  DEFAULT_USER_ID: objectId24.default(DEMO_USER_OBJECT_ID),
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
