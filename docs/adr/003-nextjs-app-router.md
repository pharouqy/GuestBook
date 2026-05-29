# ADR-003 — Next.js App Router avec React Server Components

**Date** : 2026-05-28  
**Statut** : Accepté  
**Décideurs** : Équipe Architecture  

---

## Contexte

Next.js propose deux paradigmes de routing : le Pages Router (legacy) et l'App Router (moderne, stable depuis Next.js 13.4). Le choix du router conditionne l'architecture de tout le frontend.

## Décision

Adopter **Next.js App Router** avec React Server Components (RSC) comme paradigme par défaut.

## Architecture des routes

```
src/app/
├── (public)/               ← Route Group : pas de /public dans l'URL
│   ├── page.tsx            ← / (homepage — liste des messages)
│   └── layout.tsx          ← Layout public (header, footer)
├── (admin)/                ← Route Group : pas de /admin dans l'URL
│   ├── admin/
│   │   ├── page.tsx        ← /admin (dashboard)
│   │   └── login/
│   │       └── page.tsx    ← /admin/login
│   └── layout.tsx          ← Layout admin (sidebar, protégé par middleware)
├── api/                    ← Route Handlers (BFF léger si nécessaire)
├── globals.css
└── layout.tsx              ← Root layout (html, body, providers)
```

## Règle d'or : Server vs Client Components

| Composant | Directive | Quand l'utiliser |
|-----------|-----------|------------------|
| Server Component | (aucune) | Fetch de données, affichage statique, SEO |
| Client Component | `'use client'` | État React, événements, hooks du navigateur |

**Anti-pattern à bannir** : mettre `'use client'` sur tous les composants "par habitude".

## Conséquences

### ✅ Avantages
- **Performance** : Le fetch de la liste des messages se fait côté serveur — zéro JavaScript envoyé au navigateur pour l'affichage initial
- **SEO** : Le HTML est complet à la première requête → les robots indexent le contenu du livre d'or
- **Sécurité** : Les variables d'environnement backend (URL de l'API) restent sur le serveur Next.js — jamais exposées au navigateur
- **Layouts imbriqués** : L'admin et le public ont des layouts complètement différents sans impact sur les URLs
- **Streaming** : `loading.tsx` et `Suspense` permettent un affichage progressif

### ❌ Alternatives rejetées
- **Pages Router** : Pas de Server Components natifs, pas de layouts imbriqués — technologie en fin de vie
- **SPA React (Vite)** : Pas de SSR → mauvais SEO pour la page publique du livre d'or
