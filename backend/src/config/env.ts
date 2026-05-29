/**
 * @file env.ts
 * @description Validation et typage des variables d'environnement via Zod.
 * 
 * PRINCIPE : Les variables d'env sont validées au démarrage du serveur.
 * Si une variable obligatoire est manquante ou invalide → crash immédiat avec
 * un message explicite. Il vaut mieux crasher au démarrage que d'avoir un
 * comportement imprévisible en production.
 */

import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  // Serveur
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000').transform(Number),

  // MongoDB
  MONGODB_URI: z.string().url('MONGODB_URI doit être une URL MongoDB valide'),
  MONGODB_URI_TEST: z.string().url().optional(),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET doit faire au minimum 32 caractères'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET doit faire au minimum 32 caractères'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().url('CORS_ORIGIN doit être une URL valide'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

// Validation au chargement du module
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Variables d\'environnement invalides :');
  console.error(parseResult.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parseResult.data;
export type Env = typeof env;
