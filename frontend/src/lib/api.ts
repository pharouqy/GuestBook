/**
 * @file lib/api.ts
 * @description Client HTTP typé — wrapper fetch vers l'API Express.
 * 
 * PRINCIPES :
 * - Toutes les requêtes backend passent par ce module (source de vérité unique)
 * - Côté Server Components : utilise API_URL (secret serveur)
 * - Côté Client Components  : passe par les Route Handlers Next.js (BFF)
 * - Les erreurs API sont normalisées en ApiError
 * 
 * USAGE (Server Component) :
 *   const messages = await apiClient.get<PaginatedMessages>('/messages');
 */

import type { ApiResponse, ApiSuccessResponse } from '@guestbook/shared';

// API_URL n'est disponible que côté serveur (pas de NEXT_PUBLIC_)
const API_BASE_URL = process.env['API_URL'] ?? 'http://localhost:4000';
const API_VERSION = 'v1';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string; // Access token JWT (pour les requêtes admin)
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    // Next.js cache : no-store par défaut pour les données dynamiques
    // Les Server Components peuvent surcharger avec { next: { revalidate: 60 } }
    cache: fetchOptions.cache ?? 'no-store',
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiError(
      json.error.code,
      json.error.message,
      response.status,
      json.error.details,
    );
  }

  return (json as ApiSuccessResponse<T>).data;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T = void>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
