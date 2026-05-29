/**
 * @file components/messages/MessageCard.tsx
 * @description Carte d'affichage d'un message du livre d'or.
 * 
 * SERVER COMPONENT (pas d'interactivité, affichage pur).
 * Utilisé dans la page publique ET le dashboard admin.
 * 
 * En mode admin : affiche les actions (approuver/rejeter/supprimer).
 */

import type { MessageDTO } from '@guestbook/shared';
import { Badge } from '@/components/ui/Badge';

interface MessageCardProps {
  message: MessageDTO;
  adminMode?: boolean;
  // Les actions admin seront des Client Components wrappés ici en Étape 4
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

// Fonction pour générer une couleur déterministe basée sur le nom
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-cyan-500',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function MessageCard({ message, adminMode = false }: MessageCardProps) {
  const avatarColor = getAvatarColor(message.author);
  const isPending = !message.isApproved;

  return (
    <article
      className={[
        'group relative rounded-2xl border-2 bg-card p-6 shadow-medium',
        'transition-all duration-300 hover:shadow-elevated',
        'hover:border-primary/50 overflow-hidden',
        isPending && adminMode
          ? 'border-warning/40 bg-gradient-to-br from-warning/5 to-warning/2 dark:from-warning/10 dark:to-warning/5'
          : 'border-border/50',
      ].join(' ')}
      aria-label={`Message de ${message.author}`}
    >
      {/* Décoration de coin */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex items-start gap-4">
        {/* Avatar avec initiales */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${avatarColor} text-lg font-bold text-white shadow-md`}
          aria-hidden="true"
        >
          {getInitials(message.author)}
        </div>

        <div className="min-w-0 flex-1">
          {/* En-tête */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-bold text-foreground text-base">{message.author}</p>
              <time
                dateTime={message.createdAt}
                className="text-xs font-medium text-muted-foreground"
              >
                {formatDate(message.createdAt)}
              </time>
            </div>

            {/* Badge modération (admin uniquement) */}
            {adminMode && (
              <Badge variant={message.isApproved ? 'success' : 'warning'}>
                {message.isApproved ? '✓ Approuvé' : '⏳ Attente'}
              </Badge>
            )}
          </div>

          {/* Contenu du message */}
          <blockquote className="mt-4 text-sm leading-relaxed text-foreground/85 border-l-4 border-primary/20 pl-4 py-1">
            "{message.content}"
          </blockquote>
        </div>
      </div>
    </article>
  );
}
