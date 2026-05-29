/**
 * @file tests/setup.ts
 * @description Configuration globale Vitest — chargement des variables d'env de test.
 */

import { config } from 'dotenv';
import path from 'path';

// Charger .env.test avant tout (override les valeurs par défaut)
config({ path: path.resolve(__dirname, '../.env.test') });
