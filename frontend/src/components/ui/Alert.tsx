/**
 * @file components/ui/Alert.tsx
 * @description Composant Alert pour afficher des messages d'erreur, succès, ou informatif.
 * 
 * VARIANTES : success | warning | error | info
 */

import { ReactNode } from 'react';

interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: ReactNode;
  className?: string;
  icon?: string;
}

const config = {
  success: {
    icon: '✅',
    bg: 'bg-success/5',
    border: 'border-success/30',
    text: 'text-success',
    title: 'text-success/90',
  },
  warning: {
    icon: '⚠️',
    bg: 'bg-warning/5',
    border: 'border-warning/30',
    text: 'text-warning',
    title: 'text-warning/90',
  },
  error: {
    icon: '❌',
    bg: 'bg-destructive/5',
    border: 'border-destructive/30',
    text: 'text-destructive',
    title: 'text-destructive/90',
  },
  info: {
    icon: 'ℹ️',
    bg: 'bg-primary/5',
    border: 'border-primary/30',
    text: 'text-primary',
    title: 'text-primary/90',
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  icon,
}: AlertProps) {
  const { bg, border, text, title: titleClass } = config[variant];
  const iconEmoji = icon ?? config[variant].icon;

  return (
    <div
      className={`flex gap-3 rounded-lg border-2 ${bg} ${border} p-4 ${className}`}
      role="alert"
    >
      <div className={`shrink-0 text-lg mt-0.5`}>{iconEmoji}</div>
      <div className="flex-1">
        {title && (
          <p className={`font-semibold ${titleClass}`}>{title}</p>
        )}
        <p className={`text-sm ${text}`}>
          {children}
        </p>
      </div>
    </div>
  );
}
