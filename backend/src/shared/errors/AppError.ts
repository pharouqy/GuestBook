/**
 * @file errors/AppError.ts
 * @description Hiérarchie d'erreurs custom pour le backend.
 * 
 * PRINCIPE : Toutes les erreurs métier héritent de AppError.
 * Le global error handler (error.middleware.ts) les intercepte et formate
 * la réponse HTTP appropriée.
 * 
 * UTILISATION :
 *   throw new NotFoundError('Message non trouvé')
 *   throw new ValidationError('Champ invalide', { field: ['erreur'] })
 *   throw new UnauthorizedError()
 */

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    // Restaure le prototype chain (nécessaire quand on étend Error en TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400 — Données invalides (validation Zod, logique métier) */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/** 401 — Non authentifié */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentification requise') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 — Authentifié mais non autorisé */
export class ForbiddenError extends AppError {
  constructor(message = 'Accès interdit') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 404 — Ressource non trouvée */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

/** 409 — Conflit (ressource déjà existante) */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/** 429 — Trop de requêtes */
export class RateLimitError extends AppError {
  constructor(message = 'Trop de requêtes, réessayez plus tard') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/** 500 — Erreur interne (ne jamais exposer les détails au client) */
export class InternalServerError extends AppError {
  constructor(message = 'Erreur interne du serveur') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
