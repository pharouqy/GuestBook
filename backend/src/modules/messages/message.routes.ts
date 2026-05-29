/**
 * @file modules/messages/message.routes.ts
 * @description Définition des routes HTTP du module Messages.
 * 
 * STRUCTURE :
 * Public  → GET  /api/messages          (liste paginée des approuvés)
 * Public  → POST /api/messages          (soumettre un message)
 * Admin   → GET  /api/admin/messages    (tous les messages)
 * Admin   → PATCH /api/admin/messages/:id/approve
 * Admin   → DELETE /api/admin/messages/:id
 * 
 * La protection auth est appliquée au niveau des routes admin dans app.ts.
 */

import { Router } from 'express';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createMessageSchema,
  approveMessageSchema,
  paginationQuerySchema,
  mongoIdParamSchema,
} from './message.validation';

// Injection de dépendances (DI manuelle — pas de framework IoC nécessaire à ce stade)
const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);

// ── Routes publiques ───────────────────────────────────────────────────────────
export const publicMessageRouter = Router();

publicMessageRouter.get(
  '/',
  validate({ query: paginationQuerySchema }),
  messageController.getPublic,
);

publicMessageRouter.post(
  '/',
  validate({ body: createMessageSchema }),
  messageController.create,
);

// ── Routes admin (protégées par authMiddleware) ────────────────────────────────
export const adminMessageRouter = Router();

adminMessageRouter.get(
  '/',
  authMiddleware,
  validate({ query: paginationQuerySchema }),
  messageController.getAll,
);

adminMessageRouter.patch(
  '/:id/approve',
  authMiddleware,
  validate({ params: mongoIdParamSchema, body: approveMessageSchema }),
  messageController.approve,
);

adminMessageRouter.delete(
  '/:id',
  authMiddleware,
  validate({ params: mongoIdParamSchema }),
  messageController.delete,
);
