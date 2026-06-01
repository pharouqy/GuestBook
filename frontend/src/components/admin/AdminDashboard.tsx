/**
 * @file components/admin/AdminDashboard.tsx
 * @description Tableau de bord de modération interactif — Client Component.
 * 
 * DESIGN : Interface premium avec filtrage en temps réel, animations de transition
 * lors de la modération, et retours utilisateur instantanés.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { PaginatedMessages, MessageDTO } from '@guestbook/shared';

export function AdminDashboard() {
  const router = useRouter();
  const { accessToken, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('pending');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10); // 10 items per page

  // Récupérer les messages paginés depuis l'API Express (via le proxy Next.js)
  const fetchMessages = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/proxy/admin/messages?page=${currentPage}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Impossible de charger les messages.');
      }

      const body = (await res.json()) as { success: boolean; data: PaginatedMessages };
      if (body.success) {
        setMessages(body.data.messages);
        setTotalPages(body.data.pagination.totalPages);
      } else {
        throw new Error('Échec du chargement des données.');
      }
    } catch (err) {
      console.error('Fetch admin messages failed:', err);
      setError('Erreur lors du chargement des messages. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentPage, limit]);

  // Charger au montage, quand le token change, ou quand la page/limit change
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      void fetchMessages();
    }
  }, [isAuthenticated, accessToken, fetchMessages, currentPage, limit]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/admin/login?from=/admin');
    }
  }, [authLoading, isAuthenticated, router]);

  // Action : Approuver un message
  const handleApprove = async (id: string) => {
    if (!accessToken) return;

    try {
      const res = await fetch(`/api/proxy/admin/messages/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isApproved: true }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de l\'approbation.');
      }

      // Mise à jour de l'état local (transition fluide)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, isApproved: true } : msg))
      );
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Impossible d\'approuver le message pour le moment.');
    }
  };

  // Action : Supprimer un message
  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce message ?')) return;

    try {
      const res = await fetch(`/api/proxy/admin/messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression.');
      }

      // Transition de suppression fluide
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Impossible de supprimer le message pour le moment.');
    }
  };

  // Filtrer les messages pour l'affichage selon l'onglet actif
  const filteredMessages = messages.filter((msg) => {
    if (activeTab === 'pending') return !msg.isApproved;
    if (activeTab === 'approved') return msg.isApproved;
    return true;
  });

  // Chargement de l'auth silencieuse
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Vérification de la session admin...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Redirection vers la connexion...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre d'en-tête admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-border/50 pb-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            🎯 Tableau de Bord Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Modérez et gérez les messages en temps réel • {messages.length} au total
          </p>
        </div>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => { void logout(); }}
          className="self-start sm:self-center"
        >
          🔐 Déconnexion
        </Button>
      </header>

      {/* Barre d'onglets de filtrage avec badges */}
      <div className="flex flex-wrap gap-3 border-b-2 border-border/50 pb-4">
        {[
          { id: 'pending' as const, label: '⏳ En attente', count: messages.filter((m) => !m.isApproved).length },
          { id: 'approved' as const, label: '✅ Approuvés', count: messages.filter((m) => m.isApproved).length },
          { id: 'all' as const, label: '📋 Tous', count: messages.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'border-2 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {tab.label} <Badge className="ml-2">{tab.count}</Badge>
          </button>
        ))}
      </div>

      {/* Contenu principal */}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive animate-slide-down">
          <svg className="h-5 w-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground font-medium">Chargement des messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-4xl" role="img" aria-label="Vide">📂</p>
          <p className="mt-4 font-semibold text-foreground">Aucun message</p>
          <p className="text-sm text-muted-foreground mt-1">
            Aucun message dans cette catégorie pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {filteredMessages.map((message, index) => (
            <article
              key={message.id}
              className={`flex flex-col justify-between rounded-2xl border-2 bg-card p-6 shadow-medium transition-all duration-300 hover:shadow-elevated hover:border-primary/50 animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header du message */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-lg">{message.author}</p>
                    <time className="text-xs font-medium text-muted-foreground mt-0.5">
                      {new Date(message.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <Badge variant={message.isApproved ? 'success' : 'warning'}>
                    {message.isApproved ? '✅ Approuvé' : '⏳ Attente'}
                  </Badge>
                </div>
                <blockquote className="text-foreground/85 text-sm leading-relaxed border-l-4 border-primary/20 pl-4 py-1">
                  "{message.content}"
                </blockquote>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-2 border-t-2 border-border/50 pt-4">
                {!message.isApproved && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      void handleApprove(message.id);
                    }}
                    className="flex-1"
                  >
                    ✓ Approuver
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void handleDelete(message.id);
                  }}
                  className="flex-1"
                >
                  🗑️ Supprimer
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);
              }}
              disabled={currentPage <= 1}
              className="p-2 rounded hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
              aria-label="Page précédente"
            >
              ‹
            </button>

            <span className="px-4 text-sm font-medium text-foreground">
              Page {currentPage} sur {totalPages}
            </span>

            <button
              onClick={() => {
                const newPage = Math.min(totalPages, currentPage + 1);
                setCurrentPage(newPage);
              }}
              disabled={currentPage >= totalPages}
              className="p-2 rounded hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
              aria-label="Page suivante"
            >
              ›
            </button>
          </div>
        )}
      )}
    </div>
  );
}
