/**
 * @file logger.ts
 * @description Logger Pino — structured JSON logging pour la production.
 * 
 * POURQUOI PINO : 5× plus rapide que Winston grâce au logging asynchrone.
 * En production, les logs JSON sont ingérables par Datadog, CloudWatch, etc.
 * En développement, pino-pretty formate les logs de façon lisible.
 */

import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    },
  }),
  // En production : JSON brut pour les aggregators de logs
  ...(env.NODE_ENV === 'production' && {
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
  }),
});
