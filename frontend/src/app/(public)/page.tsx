'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { apiClient } from '@/lib/api';
import { MessageForm } from '@/components/messages/MessageForm';
import { MessageCard } from '@/components/messages/MessageCard';
import type { PaginatedMessages } from '@guestbook/shared';

function HomePageInner() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const limit = 10;

  const [data, setData] = useState<PaginatedMessages | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<PaginatedMessages>(
          `/messages?page=${page}&limit=${limit}`,
          { next: { revalidate: 60 } }
        );
        if (!cancelled) {
          setData(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Impossible de charger les messages pour le moment.');
          console.warn('Fetch messages failed:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="animate-pulse rounded bg-primary/20 p-8">
          <h2 className="text-2xl font-bold text-foreground">Chargement des messages…</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 rounded-lg border-2 border-destructive/30 bg-destructive/5 p-6">
        <p className="text-lg font-semibold text-destructive">⚠️ Erreur</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null; // Should not happen
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
            <div className="text-2xl font-bold text-accent">{data?.pagination.totalPages || 0}</div>
            <div className="text-xs text-muted-foreground">Pages</div>
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
        {data?.messages.length === 0 ? (
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-12">
            <p className="text-5xl" role="img">📝</p>
            <p className="font-semibold text-lg text-foreground">Aucun message pour le moment</p>
            <p className="text-sm text-muted-foreground">Soyez le premier à laisser un message dans ce livre d'or !</p>
          </div>
        ) : (
          <>
            <div className="max-w-4xl mx-auto grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {data?.messages.map((message, index) => (
                <div key={message.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                  <MessageCard message={message} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex justify-center items-center space-x-4">
              <button
                onClick={() => {
                  const newPage = Math.max(1, page - 1);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', newPage.toString());
                  window.history.replaceState(null, '', `?${params.toString()}`);
                }}
                disabled={page <= 1}
                className="p-2 rounded hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
                aria-label="Page précédente"
              >
                ‹
              </button>

              <span className="px-4 text-sm font-medium text-foreground">
                Page {page} sur {data?.pagination.totalPages ?? 0}
              </span>

              <button
                onClick={() => {
                  const newPage = page + 1;
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', newPage.toString());
                  window.history.replaceState(null, '', `?${params.toString()}`);
                }}
                disabled={page >= (data?.pagination.totalPages ?? 1)}
                className="p-2 rounded hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
                aria-label="Page suivante"
              >
                ›
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center py-12">
      <div className="animate-pulse rounded bg-primary/20 p-8">
        <h2 className="text-2xl font-bold text-foreground">Chargement des messages…</h2>
      </div>
    </div>}>
      <HomePageInner />
    </Suspense>
  );
}
