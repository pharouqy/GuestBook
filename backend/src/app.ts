/**
 * @file app.ts
 * @description Configuration Express : middlewares globaux et montage des routes.
 * 
 * ORDRE CRITIQUE des middlewares (ne pas changer) :
 * 1. Sécurité (helmet, cors)
 * 2. Rate limiting global
 * 3. Parsing (json, cookies)
 * 4. Logging HTTP
 * 5. Routes applicatives
 * 6. 404 handler
 * 7. Error handler (DOIT être en dernier)
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { globalRateLimit } from './middlewares/rate-limit.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { publicMessageRouter, adminMessageRouter } from './modules/messages/message.routes';

const app = express();

// ── 1. Sécurité ───────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Peut casser certains assets en dev
  }),
);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,            // Nécessaire pour les cookies cross-origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── 2. Rate Limiting global ───────────────────────────────────────────────────
app.use(globalRateLimit);

// ── 3. Parsing ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limite la taille du body (protection DoS)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── 4. Logging HTTP ───────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ── 5. Routes ─────────────────────────────────────────────────────────────────
const API_PREFIX = `/api/${env.API_VERSION ?? 'v1'}`;

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/messages`, publicMessageRouter);
app.use(`${API_PREFIX}/admin/messages`, adminMessageRouter);

// Health check (pour les load balancers, Docker health checks)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 6. 404 Handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route introuvable' },
  });
});

// ── 7. Global Error Handler (DOIT être en dernier) ────────────────────────────
app.use(errorMiddleware);

export { app };
