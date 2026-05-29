/**
 * @file middlewares/validate.middleware.ts
 * @description Middleware de validation Zod — valide req.body, req.params, req.query.
 * 
 * PRINCIPE : La validation est appliquée AVANT le Controller.
 * Si les données sont invalides → 400 avec les détails Zod.
 * Le Controller ne reçoit que des données valides et typées.
 * 
 * UTILISATION :
 *   router.post('/', validate({ body: createMessageSchema }), controller.create)
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors/AppError';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as unknown;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transformer les erreurs Zod en format { field: ['message'] }
        const details: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!details[field]) details[field] = [];
          details[field]!.push(err.message);
        });
        next(new ValidationError('Données invalides', details));
        return;
      }
      next(error);
    }
  };
}
