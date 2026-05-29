/**
 * @file modules/auth/auth.service.ts
 * @description Logique métier de l'authentification admin.
 * 
 * RESPONSABILITÉS :
 * - Vérification des credentials admin (email + mot de passe bcrypt)
 * - Génération des tokens JWT (access + refresh)
 * - Renouvellement silencieux via refresh token
 * - Logout (invalidation du refresh token)
 * 
 * RÈGLE : Ce service ne connaît pas Express (pas de req/res)
 * RÈGLE : Les secrets JWT viennent exclusivement de env.ts
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../shared/errors/AppError';
import type { AuthTokenDTO, AdminDTO } from '@guestbook/shared';
import { AdminRepository, AdminCredentials } from './admin.repository';

interface TokenPair {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

type JwtExpiresIn = Exclude<jwt.SignOptions['expiresIn'], undefined>;

export class AuthService {
  constructor(private readonly adminRepository: AdminRepository) {}

  /**
   * Vérifie les credentials et retourne les tokens JWT
   * @throws UnauthorizedError si email ou mot de passe invalide
   */
  async login(email: string, password: string): Promise<TokenPair> {
    const admin = await this.adminRepository.findByEmail(email);

    // Protection contre les timing attacks : on fait toujours bcrypt.compare
    // même si l'adresse email n'est pas trouvée dans notre base de données.
    const dummyHash = '$2a$10$abcdefghijklmnopqrstuvwxyzu1234567890123456789012345';
    const hashToCompare = admin ? admin.passwordHash : dummyHash;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!admin || !isPasswordValid) {
      // Message générique pour ne pas divulguer l'existence d'un compte
      throw new UnauthorizedError('Identifiants incorrects');
    }

    return this.generateTokenPair(admin);
  }

  /**
   * Génère une nouvelle paire access/refresh token
   */
  private generateTokenPair(admin: AdminCredentials): TokenPair {
    const accessToken = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as JwtExpiresIn },
    );

    const refreshToken = jwt.sign(
      { sub: admin.id, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as JwtExpiresIn },
    );

    return {
      accessToken,
      expiresIn: 15 * 60, // 900 secondes = 15 minutes
      refreshToken,
    };
  }

  /**
   * Vérifie un refresh token et retourne un nouvel access token
   * @throws UnauthorizedError si le token est invalide ou expiré
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokenDTO> {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        sub: string;
        type: string;
      };

      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Refresh token invalide');
      }

      const admin = await this.adminRepository.findById(payload.sub);
      if (!admin) {
        throw new UnauthorizedError('Administrateur non trouvé');
      }

      const accessToken = jwt.sign(
        { sub: admin.id, email: admin.email, role: admin.role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES_IN as JwtExpiresIn },
      );

      return { accessToken, expiresIn: 15 * 60 };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Refresh token expiré ou invalide');
    }
  }

  /** Formate les données admin pour la réponse (sans données sensibles) */
  toAdminDTO(admin: AdminCredentials): AdminDTO {
    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
  }
}
