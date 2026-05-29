# ADR-001 — Choix d'un Monorepo avec npm Workspaces

**Date** : 2026-05-28  
**Statut** : Accepté  
**Décideurs** : Équipe Architecture  

---

## Contexte

Le projet Guestbook comprend deux applications distinctes :
- Un **frontend** Next.js (interface utilisateur)
- Un **backend** Express (API REST)

Ces deux applications partagent des types TypeScript communs (DTOs des réponses API) et sont étroitement couplées par leur contrat d'API.

## Décision

Utiliser un **Monorepo npm Workspaces** avec la structure :
```
guestbook/
├── frontend/   (workspace)
├── backend/    (workspace)
└── shared/     (workspace — types partagés)
```

## Conséquences

### ✅ Avantages
- **Type safety cross-repo** : Si le backend renomme `author` en `authorName`, TypeScript détecte l'erreur dans le frontend immédiatement, sans déploiement
- **CI/CD simplifié** : Un seul pipeline peut tester frontend + backend + intégration
- **Versioning unifié** : Un seul `git log` montre l'évolution complète du projet
- **Refactoring sûr** : Les rename symbols TypeScript fonctionnent across workspaces
- **DX améliorée** : `npm install` à la racine installe toutes les dépendances

### ⚠️ Compromis
- Le dépôt grandit plus vite en taille (mitigé par `.gitignore`)
- Un seul `git blame` pour deux applications (acceptable pour une équipe <10)

### ❌ Alternatives rejetées
- **Multi-repo** : Synchronisation manuelle des types → drift inévitable → bugs silencieux en production
- **Turborepo/Nx** : Sur-engineering pour ce niveau de complexité — npm workspaces natifs suffisent

## Règles d'isolation

Malgré le monorepo, les deux applications restent **indépendantes et déployables séparément** :
- Aucun import direct de `backend/src` depuis `frontend/src` (et vice-versa)
- Seul le package `shared` est importé par les deux
- Chaque workspace a son propre `tsconfig.json` et ses propres scripts
