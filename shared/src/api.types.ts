/**
 * @file api.types.ts
 * @description Contrat d'API partagé entre frontend et backend.
 * 
 * RÈGLE : Ce fichier est la source de vérité des échanges HTTP.
 * Toute modification ici doit être validée avec les deux équipes.
 * TypeScript détectera automatiquement les inconsistances.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enveloppe générique des réponses API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Réponse API standard pour les succès
 * @template T - Type du payload de données
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Réponse API standard pour les erreurs
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // Erreurs de validation Zod
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─────────────────────────────────────────────────────────────────────────────
// Module Messages — DTOs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO d'un message tel que retourné par l'API
 * (jamais le Document Mongoose brut)
 */
export interface MessageDTO {
  id: string;           // ObjectId MongoDB stringifié
  author: string;       // Prénom/pseudo de l'auteur
  content: string;      // Contenu du message
  createdAt: string;    // ISO 8601 — toujours string en JSON
  isApproved: boolean;  // Modéré par l'admin
}

/**
 * Payload pour créer un nouveau message (POST /api/messages)
 */
export interface CreateMessagePayload {
  author: string;
  content: string;
}

/**
 * Payload pour modérer un message (PATCH /api/messages/:id/approve)
 */
export interface ApproveMessagePayload {
  isApproved: boolean;
}

/**
 * Réponse paginée pour la liste des messages
 */
export interface PaginatedMessages {
  messages: MessageDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Module Auth — DTOs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Payload de connexion admin (POST /api/auth/login)
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Réponse de connexion réussie
 * Note : le Refresh Token est dans le cookie HttpOnly — pas dans ce DTO
 */
export interface AuthTokenDTO {
  accessToken: string;
  expiresIn: number; // Secondes avant expiration (900 = 15min)
}

/**
 * Payload Admin (informations de l'admin connecté)
 */
export interface AdminDTO {
  id: string;
  email: string;
  role: 'admin';
}
