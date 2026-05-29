/**
 * @file db.ts
 * @description Connexion Mongoose avec gestion des événements de connexion.
 * 
 * PRINCIPE : La connexion DB est un singleton. Ce module expose une fonction
 * `connectDB` appelée une seule fois au démarrage dans server.ts.
 * Mongoose gère le connection pooling automatiquement.
 */

import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

const MONGODB_URI =
  env.NODE_ENV === 'test' ? (env.MONGODB_URI_TEST ?? env.MONGODB_URI) : env.MONGODB_URI;

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      // Options recommandées pour la production
      maxPoolSize: 10,          // Nombre max de connexions dans le pool
      serverSelectionTimeoutMS: 5000,  // Timeout si MongoDB n'est pas joignable
      socketTimeoutMS: 45000,   // Timeout d'une opération
    });

    logger.info({ uri: MONGODB_URI.replace(/\/\/.*@/, '//***@') }, 'MongoDB connecté');

    // Événements de monitoring
    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'Erreur MongoDB');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB déconnecté — tentative de reconnexion automatique');
    });

  } catch (error) {
    logger.error({ err: error }, 'Échec connexion MongoDB — arrêt du serveur');
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB déconnecté proprement');
}
