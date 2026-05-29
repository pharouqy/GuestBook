/**
 * @file hooks/useFormState.ts
 * @description Hook personnalisé pour la gestion des états de formulaire.
 * 
 * Encapsule le pattern loading/success/error commun à tous les formulaires.
 * Évite la duplication d'état dans chaque Client Component.
 * 
 * USAGE :
 *   const { state, submit, reset } = useFormState(async (data) => {
 *     await apiClient.post('/messages', data);
 *   });
 */

'use client';

import { useState, useCallback } from 'react';
import type { FormState } from '@/types';
import { ApiError } from '@/lib/api';

export function useFormState<TData = unknown, TInput = unknown>(
  action: (input: TInput) => Promise<TData>,
) {
  const [state, setState] = useState<FormState<TData>>({ status: 'idle' });

  const submit = useCallback(
    async (input: TInput): Promise<void> => {
      setState({ status: 'loading' });

      try {
        const data = await action(input);
        setState({ status: 'success', data });
      } catch (error) {
        if (error instanceof ApiError) {
          setState({
            status: 'error',
            error: error.message,
            fieldErrors: error.details,
          });
        } else {
          setState({
            status: 'error',
            error: 'Une erreur inattendue est survenue. Réessayez.',
          });
        }
      }
    },
    [action],
  );

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    state,
    submit,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
}
