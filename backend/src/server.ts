/**
 * @file server.ts
 * @description Point d'entrée du backend — connexion DB puis démarrage HTTP.
 * 
 * ORDRE DE DÉMARRAGE :
 * 1. Validation des variables d'environnement (env.ts — auto au require)
 * 2. Connexion MongoDB (crash si échoue)
 * 3. Démarrage du serveur HTTP
 * 4. Gestion du shutdown graceful (SIGTERM, SIGINT)
 * 
 * SHUTDOWN GRACEFUL : En production, Kubernetes/Docker envoie SIGTERM.
 * On attend que les requêtes en cours terminent avant de fermer.
 */

import { app } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

const PORT = env.PORT;

async function start(): Promise<void> {
  // 1. Connexion MongoDB (bloquant — le serveur ne démarre pas sans BDD)
  await connectDB();

  // 2. Démarrage du serveur HTTP
  const server = app.listen(PORT, () => {
    logger.info(
      { port: PORT, env: env.NODE_ENV },
      `🚀 Serveur démarré sur http://localhost:${PORT}`,
    );
  });

  // ── Shutdown Graceful ──────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Signal reçu — arrêt graceful en cours...');

    server.close(async () => {
      logger.info('Serveur HTTP fermé — plus de nouvelles connexions');

      await disconnectDB();
      logger.info('Shutdown complet');
      process.exit(0);
    });

    // Force kill après 10 secondes si le shutdown traîne
    setTimeout(() => {
      logger.error('Shutdown forcé après timeout (10s)');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT', () => { void shutdown('SIGINT'); });

  // Gestion des promesses rejetées non catchées (filet de sécurité)
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Promesse rejetée non gérée — arrêt du processus');
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Exception non catchée — arrêt du processus');
    process.exit(1);
  });
}

// Démarrage
void start();
