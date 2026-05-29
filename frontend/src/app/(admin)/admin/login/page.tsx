/**
 * @file app/(admin)/admin/login/page.tsx
 * @description Page de connexion admin.
 * 
 * SERVER COMPONENT pour les métadonnées + structure.
 * Affiche le LoginForm interactif (Client Component).
 */

import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion Admin',
  description: 'Espace réservé aux administrateurs.',
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Décoration de coin */}
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <span className="text-3xl" role="img" aria-label="Sécurisé">🔐</span>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Espace Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Authentifiez-vous pour modérer et gérer le livre d'or
            </p>
          </div>
        </div>

        {/* Formulaire interactif */}
        <LoginForm />

        {/* Informations de base */}
        <div className="rounded-lg border-2 border-border/50 bg-muted/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Cet espace est sécurisé et protégé par JWT
          </p>
        </div>
      </div>
    </div>
  );
}
