/**
 * @file lib/validations.ts
 * @description Schémas Zod côté frontend — validation des formulaires.
 * 
 * NOTE : Ces schémas sont un SOUS-ENSEMBLE de ceux du backend.
 * La validation frontend améliore l'UX (feedback immédiat).
 * La validation backend est la SEULE source de vérité de sécurité.
 * Ne jamais supprimer la validation backend sous prétexte que le frontend valide.
 */

import { z } from 'zod';

/** Formulaire de création d'un message (page publique) */
export const createMessageFormSchema = z.object({
  author: z
    .string()
    .trim()
    .min(2, 'Votre prénom doit faire au moins 2 caractères')
    .max(50, 'Votre prénom ne peut pas dépasser 50 caractères'),

  content: z
    .string()
    .trim()
    .min(10, 'Votre message doit faire au moins 10 caractères')
    .max(500, 'Votre message ne peut pas dépasser 500 caractères'),
});

/** Formulaire de connexion admin */
export const loginFormSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Types inférés pour les formulaires React
export type CreateMessageFormValues = z.infer<typeof createMessageFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
