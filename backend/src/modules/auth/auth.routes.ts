/**
 * @file modules/auth/auth.routes.ts
 * @description Routes d'authentification admin.
 * 
 * POST /api/auth/login    → Public (avec rate limiting strict anti-brute-force)
 * POST /api/auth/refresh  → Public (cookie HttpOnly requis)
 * POST /api/auth/logout   → Public
 * GET  /api/auth/me       → Protégé (authMiddleware requis)
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { authRateLimit } from '../../middlewares/rate-limit.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';

import { AdminRepository } from './admin.repository';

// Injection de dépendances
const adminRepository = new AdminRepository();
const authService = new AuthService(adminRepository);
const authController = new AuthController(authService);

// Schéma de validation du login
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const authRouter = Router();

authRouter.post(
  '/login',
  authRateLimit,                       // 5 tentatives max / 15min
  validate({ body: loginSchema }),
  authController.login,
);

authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

authRouter.get('/me', authMiddleware, authController.me);
