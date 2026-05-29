/**
 * @file types/index.ts
 * @description Types TypeScript spécifiques au frontend.
 * 
 * DISTINCTION :
 * - @guestbook/shared → types de l'API (DTOs) — partagés frontend/backend
 * - Ce fichier → types UI-only (état des formulaires, props des composants, etc.)
 */

// ── États des formulaires ──────────────────────────────────────────────────────

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T = unknown> {
  status: FormStatus;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ── Pagination ─────────────────────────────────────────────────────────────────

export interface PaginationState {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ── Composants ─────────────────────────────────────────────────────────────────

/** Variantes des boutons */
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Props communes aux composants avec className optionnel */
export interface BaseComponentProps {
  className?: string;
  'aria-label'?: string;
}

// ── Auth (côté client) ─────────────────────────────────────────────────────────

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}
