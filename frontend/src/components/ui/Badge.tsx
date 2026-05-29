/**
 * @file components/ui/Badge.tsx
 * @description Composant Badge pour les étiquettes de statut et d'état.
 * 
 * VARIANTES : primary | success | warning | destructive | accent
 */

import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent' | 'muted';
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  muted: 'bg-muted text-muted-foreground border border-border',
};

export function Badge({
  variant = 'primary',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-1 rounded-full',
        'text-xs font-semibold',
        'transition-colors duration-200',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
