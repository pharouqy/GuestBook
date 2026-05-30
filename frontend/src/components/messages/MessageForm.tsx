/**
 * @file components/messages/MessageForm.tsx
 * @description Formulaire de soumission d'un message — Client Component.
 * 
 * CLIENT COMPONENT ('use client') : gère l'état du formulaire, la validation
 * et la soumission vers l'API.
 * 
 * VALIDATION DOUBLE COUCHE :
 * 1. Zod côté client (feedback immédiat, UX)
 * 2. Zod côté API Express (source de vérité sécurité)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createMessageFormSchema, type CreateMessageFormValues } from '@/lib/validations';
import { browserApiClient, ApiError } from '@/lib/api';
import type { MessageDTO } from '@guestbook/shared';

type FormErrors = Partial<Record<keyof CreateMessageFormValues, string>>;

export function MessageForm() {
  const [values, setValues] = useState<CreateMessageFormValues>({
    author: '',
    content: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const result = createMessageFormSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof CreateMessageFormValues;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    setStatus('loading');
    setApiError(null);

    try {
      await browserApiClient.post<MessageDTO>('/messages', values);
      setStatus('success');
      setValues({ author: '', content: '' }); // Reset
    } catch (error) {
      setStatus('error');

      if (error instanceof ApiError) {
        if (error.details) {
          // Erreurs de champ venant du backend
          const fieldErrors: FormErrors = {};
          Object.entries(error.details).forEach(([field, messages]) => {
            fieldErrors[field as keyof CreateMessageFormValues] = messages[0] ?? '';
          });
          setErrors(fieldErrors);
        } else {
          setApiError(error.message);
        }
      } else {
        setApiError('Une erreur inattendue est survenue. Réessayez.');
      }
    }
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/5 to-success/2 p-8 text-center dark:from-success/10 dark:to-success/5 animate-scale-in"
      >
        <p className="text-5xl" aria-hidden="true">✅</p>
        <p className="mt-4 font-bold text-lg text-success dark:text-success/90">
          Message envoyé avec succès !
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre message sera visible après modération.
        </p>
        <Button
          variant="ghost"
          size="md"
          className="mt-6"
          onClick={() => setStatus('idle')}
        >
          Écrire un autre message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { void handleSubmit(e); }}
      noValidate
      aria-label="Formulaire de message"
      className="space-y-6 rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card to-card/50 p-8 shadow-medium animate-fade-in"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          📝 Laissez votre message
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Partagez vos impressions dans notre livre d'or
        </p>
      </div>

      {/* Erreur API globale */}
      {apiError && (
        <div 
          role="alert" 
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive animate-slide-down"
        >
          <svg className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <Input
        id="message-author"
        label="Votre nom"
        placeholder="Exemple: Jean Dupont"
        hint="Votre prénom et nom pour signer le message"
        required
        value={values.author}
        onChange={(e) => setValues((v) => ({ ...v, author: e.target.value }))}
        error={errors.author}
        disabled={status === 'loading'}
      />

      <Textarea
        id="message-content"
        label="Votre message"
        placeholder="Partagez vos impressions, vos remerciements ou vos souhaits..."
        hint="Maximum 500 caractères"
        required
        maxLength={500}
        showCharCount
        value={values.content}
        onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
        error={errors.content}
        disabled={status === 'loading'}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={status === 'loading'}
        loadingText="Envoi en cours..."
        className="w-full font-semibold"
      >
        ✓ Envoyer mon message
      </Button>
    </form>
  );
}
