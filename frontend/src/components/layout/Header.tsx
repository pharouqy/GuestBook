/**
 * @file components/layout/Header.tsx
 * @description En-tête du site avec navigation principale.
 * 
 * SERVER COMPONENT : affichage pur, pas d'interactivité.
 */

import Link from 'next/link';

interface HeaderProps {
  variant?: 'light' | 'dark';
  showAdmin?: boolean;
}

export function Header({ showAdmin = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border/50 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform hover:scale-105"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
            <span className="text-lg font-bold text-white">📖</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-foreground text-lg leading-none">
              Livre d'Or
            </h1>
            <p className="text-xs text-muted-foreground">
              Visiteurs & Souvenirs
            </p>
          </div>
        </Link>

        {/* Navigation centrale */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Messages
          </Link>
          <Link
            href="/#form"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Ajouter un message
          </Link>
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-2">
          {showAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary/20 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
            >
              <span>🔐</span>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
