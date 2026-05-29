# Guestbook — Monorepo

> Application livre d'or full-stack production-grade : Next.js App Router + Express REST API + MongoDB

---

## Architecture globale

```
Navigateur
    │
    ▼
┌─────────────────────────────────┐
│         Next.js (frontend)       │  Port 3000
│  ┌─────────────────────────────┐ │
│  │  Server Components (RSC)    │ │  ← Fetch API côté serveur
│  │  Middleware Auth (Edge)     │ │  ← Protection routes /admin
│  │  Client Components          │ │  ← Interactivité uniquement
│  └─────────────────────────────┘ │
└────────────────┬────────────────┘
                 │ HTTP/REST (server-side)
                 ▼
┌─────────────────────────────────┐
│     Express API (backend)        │  Port 4000
│  ┌─────────────────────────────┐ │
│  │  Routes → Controllers       │ │
│  │  Controllers → Services     │ │  ← Clean Architecture
│  │  Services → Repositories    │ │
│  │  Repositories → Models      │ │
│  └─────────────────────────────┘ │
└────────────────┬────────────────┘
                 │ Mongoose ODM
                 ▼
┌─────────────────────────────────┐
│           MongoDB Atlas          │  (jamais exposée au public)
└─────────────────────────────────┘
```

## Structure du monorepo

```
guestbook/
├── .github/workflows/          ← CI/CD pipelines
├── frontend/                   ← Next.js App Router (TypeScript)
├── backend/                    ← Express REST API (TypeScript)
├── shared/                     ← Types TypeScript partagés (DTOs)
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── package.json                ← npm workspaces root
└── README.md
```

## Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Frontend | Next.js 15 (App Router) | RSC, SEO, performance |
| Backend | Express.js + Node.js 20 | Léger, flexible, production-proven |
| Base de données | MongoDB + Mongoose | Scalable horizontalement, schéma flexible |
| Langage | TypeScript 5 (strict) | Typage statique, contrats API partagés |
| Auth | JWT + cookie HttpOnly | Stateless, résistant XSS |
| Validation | Zod | Runtime + compile-time, schémas partagés |
| Styling | Tailwind CSS | Utilitaire, DX excellence |
| Logger | Pino | Performant, JSON structured logs |
| Tests | Vitest + Supertest | Rapide, ESM natif |

## Architecture Backend — Clean Architecture

```
Route (HTTP) → Controller (Handler) → Service (Logique métier) → Repository (BDD) → Model (Schéma)
```

**Règle stricte** : chaque couche ne connaît que la couche immédiatement inférieure.
- Le Controller ne connaît pas Mongoose
- Le Service ne connaît pas Express (req, res)
- Le Repository est la seule couche qui importe Mongoose

## Authentification

- **Access Token JWT** : durée 15 minutes, vérifié dans le header `Authorization: Bearer`
- **Refresh Token** : durée 7 jours, stocké en cookie `HttpOnly; SameSite=Strict; Secure`
- **Aucun localStorage** : immunisé contre les attaques XSS
- **Aucune session serveur** : stateless → scalable horizontalement

## Stratégie de communication

```
Next.js Server Components → fetch() → Express API (port 4000)
Next.js Client Components → fetch() → Next.js Route Handlers → Express API
```

**Jamais** d'appel direct Mongoose depuis Next.js.

## Variables d'environnement

Chaque environnement dispose de ses propres variables et sa propre base MongoDB :

| Fichier | Environnement | Committé |
|---------|---------------|----------|
| `.env.example` | Modèle documentation | ✅ Oui |
| `.env` | Development local | ❌ Non (.gitignore) |
| `.env.test` | Tests | ❌ Non (.gitignore) |
| `.env.production` | Production | ❌ Non (.gitignore) |

## Sécurité — Décisions architecturales

1. **Surface d'attaque réduite** : L'API Express n'est jamais exposée directement — elle passe derrière le reverse proxy Next.js en production
2. **CORS restrictif** : Le backend n'accepte que les requêtes venant de l'origine Next.js connue
3. **Principe du moindre privilège** : Un seul rôle admin, les visiteurs sont anonymes
4. **Rate limiting** : Appliqué dès l'Étape 2 sur toutes les routes publiques
5. **Validation double couche** : Zod côté frontend ET côté backend (jamais faire confiance au client)

## Développement

### Prérequis
- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB Atlas (ou instance locale)

### Installation

```bash
# Cloner le dépôt
git clone <repo-url>
cd guestbook

# Installer toutes les dépendances (workspaces)
npm install

# Configurer les variables d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Lancer en développement (frontend + backend simultanément)
npm run dev
```

### Scripts disponibles

```bash
npm run dev          # Lance frontend (3000) + backend (4000) en parallèle
npm run build        # Build de production (shared → backend → frontend)
npm run lint         # ESLint sur tous les workspaces
npm run format       # Prettier sur tous les fichiers
npm run test         # Tests sur tous les workspaces
npm run type-check   # Vérification TypeScript sur tous les workspaces
```

## Architecture Decision Records (ADR)

Les décisions architecturales majeures sont documentées dans [`docs/adr/`](./docs/adr/).

| ADR | Titre | Statut |
|-----|-------|--------|
| [ADR-001](./docs/adr/001-monorepo.md) | Choix d'un Monorepo npm Workspaces | Accepté |
| [ADR-002](./docs/adr/002-clean-architecture.md) | Clean Architecture pour le Backend | Accepté |
| [ADR-003](./docs/adr/003-nextjs-app-router.md) | Next.js App Router avec RSC | Accepté |
| [ADR-004](./docs/adr/004-jwt-auth.md) | JWT + Cookie HttpOnly pour l'Auth Admin | Accepté |
| [ADR-005](./docs/adr/005-typescript-strict.md) | TypeScript Strict partout | Accepté |

---

*Documentation générée — Étape 1 : Architecture globale*
