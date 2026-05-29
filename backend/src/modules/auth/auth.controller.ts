/**
 * @file modules/auth/auth.controller.ts
 * @description Handlers HTTP de l'authentification admin.
 *
 * FLUX :
 * POST /api/auth/login    → login + access token + cookie refreshToken
 * POST /api/auth/refresh  → refresh access token via cookie
 * POST /api/auth/logout   → suppression cookie refresh
 * GET  /api/auth/me       → infos admin connecté
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { env } from '../../config/env';
import type {
  ApiSuccessResponse,
  AuthTokenDTO,
  AdminDTO,
} from '@guestbook/shared';
import type { AuthenticatedRequest } from '../../shared/types/express.types';

const REFRESH_COOKIE_NAME = 'refreshToken';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * LOGIN
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      const { accessToken, refreshToken, expiresIn } =
        await this.authService.login(email, password);

      res.cookie(
        REFRESH_COOKIE_NAME,
        refreshToken,
        REFRESH_COOKIE_OPTIONS,
      );

      const response: ApiSuccessResponse<AuthTokenDTO> = {
        success: true,
        data: {
          accessToken,
          expiresIn,
        },
        message: 'Connexion réussie',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * REFRESH TOKEN
   */
  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const refreshToken =
        (req.cookies as Record<string, string | undefined>)[
          REFRESH_COOKIE_NAME
        ];

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token manquant');
      }

      const { accessToken, expiresIn } =
        await this.authService.refreshAccessToken(refreshToken);

      const response: ApiSuccessResponse<AuthTokenDTO> = {
        success: true,
        data: {
          accessToken,
          expiresIn,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * LOGOUT
   */
  logout = (_req: Request, res: Response): void => {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      path: '/api/auth',
    });

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  };

  /**
   * ME
   */
  me = (req: Request, res: Response): void => {
    const admin = (req as AuthenticatedRequest).admin;

    const response: ApiSuccessResponse<AdminDTO> = {
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };

    res.status(200).json(response);
  };
}