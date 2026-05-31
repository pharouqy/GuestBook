/**
 * @file app/(public)/layout.tsx
 * @description Layout des pages publiques (liste des messages, formulaire).
 * 
 * Route Group (public) → pas de /public dans l'URL.
 * Ce layout partage la structure header/footer entre toutes les pages publiques.
 * 
 * SERVER COMPONENT par défaut (pas de 'use client').
 */

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: "Livre d'Or | Accueil",
  description: "Découvrez les messages laissés par nos visiteurs.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showAdmin={true} />

      {/* Contenu de la page avec structure améliorée */}
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
