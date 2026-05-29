/**
 * @file app/(public)/page.tsx
 * @description Page d'accueil — Liste des messages du livre d'or.
 * 
 * SERVER COMPONENT : fetch côté serveur → zéro JS pour l'affichage initial.
 * SEO : Le HTML est complet à la première requête (liste des messages visible).
 * 
 * Architecture de fetch :
 * Server Component → apiClient.get() → Express API (port 4000)
 * Le secret API_URL reste sur le serveur Next.js.
 */

import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { MessageForm } from '@/components/messages/MessageForm';
import { MessageCard } from '@/components/messages/MessageCard';
import type { PaginatedMessages } from '@guestbook/shared';

export const metadata: Metadata = {
  title: "Livre d'Or | Accueil",
  description: "Découvrez les messages laissés par nos visiteurs.",
};

// Revalidation toutes les 60 secondes (ISR — Incremental Static Regeneration)
export const revalidate = 60;

export default async function HomePage() {
  let data: PaginatedMessages | null = null;
  let error: string | null = null;

  try {
    data = await apiClient.get<PaginatedMessages>('/messages?page=1&limit=10');
  } catch (err) {
    // En SSR, on gère l'erreur gracefully (pas de crash de la page)
    error = 'Impossible de charger les messages pour le moment.';
    console.warn('Fetch messages failed:', err);
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section Améliorée */}
      <section className="relative space-y-6 text-center py-12">
        {/* Décoration */}
        <div className="absolute -inset-20 -z-10 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 blur-2xl" />
        
        <div className="space-y-3">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
            📖 Livre d&apos;Or
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            Un espace d'échange pour partager vos impressions, vos remerciements et vos souvenirs précieux.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md mx-auto mt-8">
          <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
            <div className="text-2xl font-bold text-primary">{data?.messages.length || 0}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="rounded-lg bg-success/5 border border-success/20 px-4 py-3">
            <div className="text-2xl font-bold text-success">{data?.messages.filter(m => m.isApproved).length || 0}</div>
            <div className="text-xs text-muted-foreground">Approuvés</div>
          </div>
          <div className="rounded-lg bg-accent/5 border border-accent/20 px-4 py-3">
            <div className="text-2xl font-bold text-accent">100%</div>
            <div className="text-xs text-muted-foreground">Modérés</div>
          </div>
        </div>
      </section>

      {/* Formulaire de message (Client Component interactif) */}
      <section id="form" className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground text-center">Ajoutez votre message</h2>
        <div className="max-w-2xl mx-auto">
          <MessageForm />
        </div>
      </section>

      {/* Séparateur visuel */}
      <div className="relative flex items-center gap-4 py-8">
        <div className="flex-1 border-t-2 border-border/50" />
        <div className="text-sm font-medium text-muted-foreground">Messages récents</div>
        <div className="flex-1 border-t-2 border-border/50" />
      </div>

      {/* Liste des messages */}
      <section aria-label="Messages du livre d'or" className="space-y-4">
        {error ? (
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 rounded-lg border-2 border-destructive/30 bg-destructive/5 p-6">
            <p className="text-lg font-semibold text-destructive">⚠️ Erreur</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : data?.messages.length === 0 ? (
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-12">
            <p className="text-5xl" role="img">📝</p>
            <p className="font-semibold text-lg text-foreground">Aucun message pour le moment</p>
            <p className="text-sm text-muted-foreground">Soyez le premier à laisser un message dans ce livre d'or !</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {data?.messages.map((message, index) => (
              <div key={message.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                <MessageCard message={message} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
