/**
 * @file components/ui/Textarea.tsx
 * @description Composant Textarea atomique — identique à Input mais multilignes.
 */

'use client';

import { forwardRef, TextareaHTMLAttributes, useId } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  showCharCount?: boolean | undefined;
  maxLength?: number | undefined;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      showCharCount = false,
      maxLength,
      className = '',
      id: propId,
      required,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const hasError = Boolean(error);
    const charCount = typeof value === 'string' ? value.length : 0;
    const describedBy = [hint ? hintId : null, hasError ? errorId : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor={id} className="text-sm font-semibold text-foreground">
            {label}
            {required && (
              <span className="ml-1 text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {showCharCount && maxLength && (
            <span
              className={`text-xs tabular-nums font-medium transition-colors ${
                charCount > maxLength * 0.9
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        {hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}

        <textarea
          ref={ref}
          id={id}
          required={required}
          maxLength={maxLength}
          value={value}
          aria-invalid={hasError}
          aria-required={required}
          aria-describedby={describedBy || undefined}
          className={[
            'w-full rounded-lg border-2 bg-background px-4 py-3',
            'min-h-[120px] resize-y',
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

        {hasError && (
          <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive animate-slide-down">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M6 1a5 5 0 110 10A5 5 0 016 1zm0 3a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5A.75.75 0 006 4zm0 5.5a.875.875 0 110-1.75.875.875 0 010 1.75z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
