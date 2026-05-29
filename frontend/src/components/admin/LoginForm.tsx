/**
 * @file components/admin/LoginForm.tsx
 * @description Formulaire de connexion admin interactif — Client Component.
 * 
 * DESIGN : Premium, minimaliste, avec validation Zod et retours utilisateur animés.
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginFormSchema, type LoginFormValues } from '@/lib/validations';
import { useAuth } from '@/hooks/useAuth';

type FormErrors = Partial<Record<keyof LoginFormValues, string>>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const result = loginFormSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormValues;
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
      await login(values.email, values.password);
      setStatus('success');

      // Redirection après succès
      const redirectTo = searchParams.get('from') ?? '/admin';
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('Une erreur inattendue est survenue.');
      }
    }
  };

  return (
    <form
      onSubmit={(e) => { void handleSubmit(e); }}
      noValidate
      aria-label="Connexion Espace Admin"
      className="space-y-6 rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card to-card/50 p-10 shadow-elevated backdrop-blur-md animate-fade-in"
    >
      {/* En-tête du formulaire */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">🔐 Espace Admin</h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour modérer les messages
        </p>
      </div>

      {/* Message de succès */}
      {status === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4 text-sm font-medium text-success animate-scale-in"
        >
          <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Connexion réussie ! Redirection...
        </div>
      )}

      {/* Message d'erreur global */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive animate-slide-down"
        >
          <svg className="h-5 w-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <div className="space-y-5">
        <Input
          id="login-email"
          label="Adresse email"
          type="email"
          placeholder="admin@example.com"
          hint="Votre identifiant de connexion"
          required
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          error={errors.email}
          disabled={status === 'loading' || status === 'success'}
        />

        <Input
          id="login-password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••••••"
          hint="Votre mot de passe sécurisé"
          required
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          error={errors.password}
          disabled={status === 'loading' || status === 'success'}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={status === 'loading' || status === 'success'}
        loadingText="Connexion en cours..."
        className="w-full font-semibold"
      >
        ✓ Se connecter
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Accès réservé aux administrateurs • Connexion sécurisée
      </p>
    </form>
  );
}
