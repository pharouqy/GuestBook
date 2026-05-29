/**
 * @file lib/auth.ts
 * @description Gestion du token d'authentification côté client.
 * 
 * STRATÉGIE (ADR-004) :
 * - L'Access Token est stocké en MÉMOIRE JavaScript (variable de module)
 * - PAS de localStorage → immunisé contre XSS
 * - Le Refresh Token est en cookie HttpOnly → géré automatiquement par le navigateur
 * - Au rechargement de page → renouvellement automatique via /api/auth/refresh
 * 
 * LIMITATION : La mémoire JS est perdue au rechargement.
 * C'est voulu — le Refresh Token en cookie permet de récupérer un nouvel Access Token.
 */

'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Store en mémoire (module-level singleton)
// ─────────────────────────────────────────────────────────────────────────────
let _accessToken: string | null = null;
let _tokenExpiresAt: number | null = null; // Timestamp ms

// ─────────────────────────────────────────────────────────────────────────────
// Fonctions d'accès
// ─────────────────────────────────────────────────────────────────────────────

export function setAccessToken(token: string, expiresInSeconds: number): void {
  _accessToken = token;
  // Expire 30 secondes avant pour éviter les races conditions
  _tokenExpiresAt = Date.now() + (expiresInSeconds - 30) * 1000;
}

export function getAccessToken(): string | null {
  if (!_accessToken || !_tokenExpiresAt) return null;
  if (Date.now() >= _tokenExpiresAt) {
    // Token expiré — effacer et laisser le refresh flow gérer
    clearAccessToken();
    return null;
  }
  return _accessToken;
}

export function clearAccessToken(): void {
  _accessToken = null;
  _tokenExpiresAt = null;
}

export function isTokenExpired(): boolean {
  if (!_tokenExpiresAt) return true;
  return Date.now() >= _tokenExpiresAt;
}

/**
 * Tente de renouveler l'Access Token via le Refresh Token (cookie HttpOnly).
 * Appelé automatiquement au chargement de l'app et quand le token expire.
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Envoie les cookies HttpOnly
    });

    if (!response.ok) return false;

    const data = (await response.json()) as {
      success: boolean;
      data: { accessToken: string; expiresIn: number };
    };

    if (data.success) {
      setAccessToken(data.data.accessToken, data.data.expiresIn);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
