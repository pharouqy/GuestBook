/**
 * @file middlewares/rate-limit.middleware.ts
 * @description Rate limiting — protection contre les abus et brute-force.
 * 
 * STRATÉGIE :
 * - Rate limit global : 100 requêtes / 15 minutes (configurable via env)
 * - Rate limit strict sur auth : 5 tentatives / 15 minutes (brute-force)
 * 
 * IMPORTANT : En production derrière un reverse proxy (Nginx, Vercel),
 * configurer `trustProxy: true` pour lire l'IP réelle depuis X-Forwarded-For.
 */

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import type { ApiErrorResponse } from '@guestbook/shared';

/** Rate limit général pour toutes les routes */
export const globalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-7', // Envoie les headers RateLimit-* standard
  legacyHeaders: false,
  message: (): ApiErrorResponse => ({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requêtes depuis cette IP. Réessayez dans quelques minutes.',
    },
  }),
});

/** Rate limit strict pour les routes d'authentification (anti brute-force) */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes fixe
  max: 5,                    // 5 tentatives de login max
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: (): ApiErrorResponse => ({
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Trop de tentatives de connexion. Compte temporairement bloqué (15 min).',
    },
  }),
});
