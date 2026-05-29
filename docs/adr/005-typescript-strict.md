# ADR-005 — TypeScript Strict sur Tout le Projet

**Date** : 2026-05-28  
**Statut** : Accepté  
**Décideurs** : Équipe Architecture  

---

## Contexte

Un projet full-stack avec frontend et backend peut être développé en JavaScript ou TypeScript. Le choix du typage statique conditionne la qualité du code, la maintenabilité et la détection des bugs.

## Décision

**TypeScript 5 avec `strict: true`** sur frontend ET backend, dès le premier commit.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Ce que `strict: true` active

| Option | Protection |
|--------|-----------|
| `strictNullChecks` | Détecte les `null`/`undefined` non gérés |
| `strictFunctionTypes` | Vérifie la variance des types de fonctions |
| `strictBindCallApply` | Type-check `bind`, `call`, `apply` |
| `strictPropertyInitialization` | Toutes les propriétés de classe doivent être initialisées |
| `noImplicitAny` | Interdit `any` implicite |
| `noImplicitThis` | Interdit `this` non typé |

## Types partagés via le workspace `shared`

```typescript
// shared/types/api.types.ts — LE contrat entre frontend et backend
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface MessageDTO {
  id: string;
  author: string;
  content: string;
  createdAt: string; // ISO 8601
  isApproved: boolean;
}

// Le backend retourne MessageDTO → le frontend consomme MessageDTO
// Si on renomme `author` → TypeScript erreur dans les DEUX applications
```

## Règle : Zéro `any` explicite

- Utiliser `unknown` à la place de `any` pour les types inconnus
- Utiliser `Record<string, unknown>` pour les objets non typés
- Les seules exceptions autorisées sont documentées avec `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raison`

## Conséquences

### ✅ Avantages
- **Bugs capturés à la compilation** : 30-40% des bugs runtime courants sont détectés par TypeScript strict
- **Refactoring sûr** : Renommer un champ → TypeScript indique toutes les occurrences à mettre à jour
- **Documentation vivante** : Les types servent de documentation auto-maintenue
- **IDE DX** : Autocomplétion précise, navigation "go to definition" cross-workspace

### ❌ Alternatives rejetées
- **JavaScript pur** : Zéro protection → bugs silencieux en production, refactoring aveugle
- **TypeScript laxiste** (`strict: false`)  : Pire des deux mondes — syntaxe TS sans les bénéfices
- **Migration JS → TS ultérieure** : Coût 5-10× supérieur qu'en partant directement en TS
