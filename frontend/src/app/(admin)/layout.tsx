/**
 * @file app/(admin)/layout.tsx
 * @description Layout de l'espace admin.
 * 
 * Route Group (admin) → pas de /admin-group dans l'URL.
 * Ce layout s'applique à /admin/* et /admin/login.
 * La protection réelle est faite dans middleware.ts (Edge).
 * 
 * SERVER COMPONENT — le layout lui-même n'a pas besoin d'être client.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: "Administration | Livre d'Or",
    template: "%s | Admin",
  },
  robots: {
    index: false, // Exclure l'espace admin des moteurs de recherche
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-accent/2">
      {/* Décoration de fond */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
