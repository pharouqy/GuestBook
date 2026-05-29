/**
 * @file middlewares/auth.middleware.ts
 * @description Vérification JWT — protège les routes admin.
 * 
 * PRINCIPE : Vérifie la signature et l'expiration de l'Access Token.
 * Si valide → injecte les infos admin dans req.admin.
 * Si invalide → 401 immédiat.
 * 
 * UTILISATION :
 *   router.delete('/:id', authMiddleware, messageController.delete)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../shared/errors/AppError';
import type { AuthenticatedRequest } from '../shared/types/express.types';

interface JwtAdminPayload {
  sub: string;   // admin ID
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Token Bearer manquant'));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAdminPayload;

    // Injection des infos admin dans la requête
    (req as AuthenticatedRequest).admin = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expiré'));
      return;
    }
    next(new UnauthorizedError('Token invalide'));
  }
}
