/**
 * @file hooks/useAuth.ts
 * @description Hook d'authentification admin côté client.
 * 
 * Gère le cycle de vie de l'Access Token en mémoire :
 * - Renouvellement automatique au montage (via Refresh Token cookie)
 * - Exposition de l'état d'auth aux composants
 * - Login / Logout actions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  refreshAccessToken,
} from '@/lib/auth';
import type { AuthState } from '@/types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true, // true au démarrage : on vérifie le refresh token
  });

  // Au montage : tenter un renouvellement silencieux via le cookie HttpOnly
  useEffect(() => {
    void (async () => {
      const hasToken = getAccessToken() !== null;

      if (hasToken) {
        setAuthState({ isAuthenticated: true, isLoading: false });
        return;
      }

      // Pas de token en mémoire → essayer le refresh
      const refreshed = await refreshAccessToken();
      setAuthState({ isAuthenticated: refreshed, isLoading: false });
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Nécessaire pour recevoir le cookie HttpOnly
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error: { message: string } };
      throw new Error(error.error.message);
    }

    const data = (await response.json()) as {
      data: { accessToken: string; expiresIn: number };
    };

    setAccessToken(data.data.accessToken, data.data.expiresIn);
    setAuthState({ isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    clearAccessToken();
    setAuthState({ isAuthenticated: false, isLoading: false });
  }, []);

  return {
    ...authState,
    login,
    logout,
    accessToken: getAccessToken(),
  };
}
