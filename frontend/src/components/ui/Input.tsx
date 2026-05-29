/**
 * @file components/ui/Input.tsx
 * @description Composant Input atomique avec support des erreurs de validation.
 * 
 * CLIENT COMPONENT : gère les états focus/blur et l'affichage des erreurs.
 * 
 * ACCESSIBILITÉ :
 * - Association label/input via htmlFor / id
 * - aria-invalid pour les états erreur
 * - aria-describedby pour les messages d'erreur
 * - aria-required pour les champs obligatoires
 */

'use client';

import { forwardRef, InputHTMLAttributes, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id: propId, required, ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const hasError = Boolean(error);
    const describedBy = [hint ? hintId : null, hasError ? errorId : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        <label
          htmlFor={id}
          className="text-sm font-semibold text-foreground"
        >
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {/* Hint text */}
        {hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={hasError}
          aria-required={required}
          aria-describedby={describedBy || undefined}
          className={[
            'h-10 w-full rounded-lg border-2 bg-background px-4 py-2.5',
            'text-sm text-foreground placeholder:text-muted-foreground/60',
            'transition-all duration-200 focus-ring',
            hasError
              ? 'border-destructive focus-visible:ring-destructive bg-destructive/5'
              : 'border-input hover:border-border focus-visible:border-primary focus-visible:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
            className,
          ].join(' ')}
          {...props}
        />

        {/* Message d'erreur */}
        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-destructive animate-slide-down"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 12 12"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 1a5 5 0 110 10A5 5 0 016 1zm0 3a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5A.75.75 0 006 4zm0 5.5a.875.875 0 110-1.75.875.875 0 010 1.75z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
