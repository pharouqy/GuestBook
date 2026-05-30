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
 *
 * USAGE (Client Component) :
 *   await browserApiClient.post('/messages', values);
 */

import type { ApiResponse, ApiSuccessResponse } from '@guestbook/shared';

// API_URL n'est disponible que côté serveur (pas de NEXT_PUBLIC_)
const API_BASE_URL = process.env['API_URL'] ?? 'http://localhost:4000';
// Proxy Next.js — même origine, pas d'appel direct au backend depuis le navigateur
const BROWSER_PROXY_BASE = '/api/proxy';
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
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  baseUrl: string = API_BASE_URL,
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  const url =
    baseUrl === BROWSER_PROXY_BASE
      ? `${BROWSER_PROXY_BASE}${endpoint}`
      : `${baseUrl}/api/${API_VERSION}${endpoint}`;

  const requestInit: RequestOptions = {
    ...fetchOptions,
    headers,
  };

  // Next.js cache : no-store par défaut pour les données dynamiques.
  // Les Server Components peuvent surcharger avec { next: { revalidate: 60 } }.
  if (requestInit.cache === undefined && !requestInit.next) {
    requestInit.cache = 'no-store';
  }

  const response = await fetch(url, requestInit);

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

/** Client HTTP pour les Client Components — passe par le proxy Next.js (BFF). */
export const browserApiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }, BROWSER_PROXY_BASE),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(
      endpoint,
      { method: 'POST', body: JSON.stringify(body), ...options },
      BROWSER_PROXY_BASE,
    ),

  patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(
      endpoint,
      { method: 'PATCH', body: JSON.stringify(body), ...options },
      BROWSER_PROXY_BASE,
    ),

  delete: <T = void>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }, BROWSER_PROXY_BASE),
};
