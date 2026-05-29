# ADR-002 — Clean Architecture pour le Backend Express

**Date** : 2026-05-28  
**Statut** : Accepté  
**Décideurs** : Équipe Architecture  

---

## Contexte

Le pattern le plus courant avec Express est d'écrire toute la logique dans les routes ou les controllers. Cette approche crée une dette technique massive : code impossible à tester unitairement, impossible à faire évoluer, impossible à déboguer en production.

## Décision

Adopter la **Clean Architecture** avec découpage strict en couches pour le backend :

```
HTTP Request
    │
    ▼
Routes (message.routes.ts)
    │  ← Définit les endpoints et les middlewares
    ▼
Controllers (message.controller.ts)
    │  ← Parse req/res, appelle le Service, formate la réponse
    ▼
Services (message.service.ts)
    │  ← TOUTE la logique métier. Ne connaît pas Express.
    ▼
Repositories (message.repository.ts)
    │  ← SEUL accès à la base de données. Abstraction Mongoose.
    ▼
Models (message.model.ts)
       ← Schéma Mongoose. Aucune logique métier.
```

## Règles strictes (violations = pull request rejetée)

| Règle | Justification |
|-------|---------------|
| Le Service n'importe JAMAIS `express` | Si le Service connaît `req`/`res`, il devient impossible à tester sans HTTP |
| Le Controller n'importe JAMAIS Mongoose | La logique d'accès BDD appartient au Repository |
| Le Repository retourne des types métier, pas des Documents Mongoose | Le Service ne doit pas connaître les détails de l'ODM |
| Aucun `console.log` dans les Services | Utiliser le logger Pino injecté |

## Conséquences

### ✅ Avantages
- **Testabilité** : Les Services peuvent être testés avec des mocks de Repository → pas de base de données nécessaire pour les tests unitaires
- **Évolutivité** : On peut remplacer Mongoose par Prisma en ne modifiant QUE les Repositories
- **Lisibilité** : Chaque fichier a une responsabilité claire et unique (SRP)
- **Scalabilité** : On peut exposer les Services via WebSocket ou gRPC sans dupliquer la logique

### ❌ Alternatives rejetées
- **Fat Controllers** : Rapide à écrire, catastrophique à maintenir. Refactoring coûte 10× plus tard.
- **Active Record** : Pattern Mongoose natif trop couplé à l'ODM — empêche le testing unitaire propre

## Structure type d'un module

```typescript
// message.routes.ts — UNIQUEMENT définition HTTP
router.get('/', messageController.getAll);
router.post('/', validate(createMessageSchema), messageController.create);

// message.controller.ts — UNIQUEMENT HTTP in/out
async getAll(req: Request, res: Response) {
  const messages = await this.messageService.findAll();  // ← pas de Mongoose ici
  res.json({ data: messages });
}

// message.service.ts — UNIQUEMENT logique métier
async findAll(): Promise<Message[]> {
  return this.messageRepository.findAll();  // ← pas de req/res ici
}

// message.repository.ts — UNIQUEMENT accès BDD
async findAll(): Promise<Message[]> {
  return MessageModel.find().lean();  // ← seul endroit avec Mongoose
}
```
