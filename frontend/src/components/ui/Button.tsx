/**
 * @file components/ui/Button.tsx
 * @description Composant Button atomique — base de tout le système de design.
 * 
 * CLIENT COMPONENT : gère les états interactifs (hover, focus, disabled, loading).
 * 
 * VARIANTES : primary | secondary | destructive | ghost | outline
 * TAILLES   : sm | md | lg
 * 
 * ACCESSIBILITÉ :
 * - Rôle button natif
 * - aria-disabled pour les états disabled
 * - aria-busy pour les états loading
 * - Focus visible (focus-ring utility)
 */

'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import type { ButtonVariant, ButtonSize } from '@/types';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-md hover:shadow-lg',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90 border border-border/50',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95 shadow-md hover:shadow-lg',
  ghost:
    'hover:bg-muted active:bg-muted/80 text-foreground',
  outline:
    'border-2 border-border bg-transparent hover:bg-muted/30 active:bg-muted/50 text-foreground',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg font-medium',
  md: 'h-10 px-4 py-2 text-sm rounded-lg font-medium',
  lg: 'h-12 px-6 text-base rounded-lg font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={[
          // Base
          'inline-flex items-center justify-center gap-2',
          'transition-all duration-200 ease-in-out focus-ring',
          // Variante & taille
          variantClasses[variant],
          sizeClasses[size],
          // États
          isDisabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-pointer active:scale-95',
          className,
        ].join(' ')}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  },
);

Button.displayName = 'Button';
