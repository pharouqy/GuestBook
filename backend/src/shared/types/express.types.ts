/**
 * @file shared/types/express.types.ts
 * @description Extensions des types Express pour TypeScript.
 * Ajoute les propriétés custom injectées par les middlewares.
 */

import { Request } from 'express';

/**
 * Extension de Request avec l'admin authentifié
 * Injecté par auth.middleware.ts après vérification du JWT
 */
export interface AuthenticatedRequest extends Request {
  admin: {
    id: string;
    email: string;
    role: 'admin';
  };
}
