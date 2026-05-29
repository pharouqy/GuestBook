/**
 * @file middlewares/error.middleware.ts
 * @description Global error handler Express — intercepte TOUTES les erreurs.
 * 
 * PRINCIPE : Un seul point de gestion des erreurs.
 * Les erreurs AppError sont formatées proprement.
 * Les erreurs inconnues sont loguées et masquées au client (sécurité).
 * 
 * DOIT être le DERNIER middleware enregistré dans app.ts.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';
import { logger } from '../config/logger';
import { env } from '../config/env';
import type { ApiErrorResponse } from '@guestbook/shared';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    // Erreur métier connue → log warn (pas d'alarme)
    logger.warn({ err, path: req.path, method: req.method }, 'Erreur métier');

    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...('details' in err && err.details ? { details: err.details as Record<string, string[]> } : {}),
      },
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Erreur inconnue → log error complet + masquage au client
  logger.error({ err, path: req.path, method: req.method }, 'Erreur interne non gérée');

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      // En dev : expose le message pour faciliter le débogage
      // En prod : message générique pour éviter la fuite d'informations
      message: env.NODE_ENV !== 'production' ? err.message : 'Erreur interne du serveur',
    },
  };

  res.status(500).json(response);
}
