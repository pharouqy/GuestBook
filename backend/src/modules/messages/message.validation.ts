/**
 * @file modules/messages/message.validation.ts
 * @description Schémas Zod de validation pour le module Messages.
 * 
 * RÈGLE : La validation est définie une seule fois ici et réutilisée
 * dans le middleware validate() et les Server Actions Next.js si nécessaire.
 * 
 * NOTE : Les types inférés par Zod servent dans les Controllers.
 */

import { z } from 'zod';

/** Validation création d'un message (POST /api/messages) */
export const createMessageSchema = z.object({
  author: z
    .string({ required_error: 'Le nom de l\'auteur est requis' })
    .trim()
    .min(2, 'Le nom doit faire au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

  content: z
    .string({ required_error: 'Le contenu est requis' })
    .trim()
    .min(10, 'Le message doit faire au moins 10 caractères')
    .max(500, 'Le message ne peut pas dépasser 500 caractères'),
});

/** Validation modération d'un message (PATCH /api/messages/:id/approve) */
export const approveMessageSchema = z.object({
  isApproved: z.boolean({ required_error: 'isApproved est requis' }),
});

/** Validation des paramètres de pagination (GET /api/messages?page=1&limit=10) */
export const paginationQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number).pipe(
    z.number().int().positive(),
  ),
  limit: z.string().optional().default('10').transform(Number).pipe(
    z.number().int().min(1).max(50),
  ),
});

/** Validation de l'ID MongoDB dans les paramètres d'URL */
export const mongoIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID MongoDB invalide'),
});

// Types inférés — utilisés dans les Controllers pour typer req.body
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type ApproveMessageInput = z.infer<typeof approveMessageSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
