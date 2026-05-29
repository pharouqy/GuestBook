# ADR-004 — JWT + Cookie HttpOnly pour l'Authentification Admin

**Date** : 2026-05-28  
**Statut** : Accepté  
**Décideurs** : Équipe Architecture  

---

## Contexte

L'application nécessite une authentification pour l'espace admin. Le choix de la stratégie d'authentification a des implications directes sur la sécurité (XSS, CSRF) et la scalabilité (sessions vs stateless).

## Décision

Utiliser **JWT (JSON Web Tokens) stateless** avec la stratégie **double token** :

```
┌─────────────────────────────────────────────────────────────┐
│                    Stratégie Auth                            │
│                                                             │
│  Access Token JWT                                           │
│  ├── Durée : 15 minutes                                     │
│  ├── Stockage : mémoire JavaScript (non persisté)           │
│  ├── Transport : Header Authorization: Bearer <token>       │
│  └── Contenu : { sub: adminId, role: 'admin', iat, exp }    │
│                                                             │
│  Refresh Token                                              │
│  ├── Durée : 7 jours                                        │
│  ├── Stockage : Cookie HttpOnly; SameSite=Strict; Secure    │
│  ├── Transport : Cookie automatique (navigateur)            │
│  └── Usage : renouveler l'Access Token silencieusement      │
└─────────────────────────────────────────────────────────────┘
```

## Flux d'authentification

```
1. Admin POST /api/auth/login (email + password)
   └→ Backend vérifie bcrypt
   └→ Génère Access Token (15min) + Refresh Token (7j)
   └→ Réponse : { accessToken } + Set-Cookie: refreshToken=...

2. Requête protégée (ex: DELETE /api/messages/:id)
   └→ Frontend envoie Authorization: Bearer <accessToken>
   └→ Backend vérifie la signature JWT
   └→ Si expiré → 401

3. Renouvellement silencieux
   └→ Frontend POST /api/auth/refresh (cookie envoyé automatiquement)
   └→ Backend vérifie le refresh token
   └→ Retourne un nouvel Access Token

4. Logout
   └→ Backend invalide le refresh token (blacklist ou rotation)
   └→ Supprime le cookie côté client
```

## Décisions de sécurité

| Décision | Justification |
|----------|---------------|
| ❌ localStorage pour JWT | Accessible au JavaScript → vulnérable XSS |
| ✅ Cookie HttpOnly pour Refresh Token | Inaccessible au JavaScript — même en cas de XSS |
| ✅ SameSite=Strict | Protection CSRF — le cookie n'est pas envoyé sur les requêtes cross-site |
| ✅ Secure | Cookie uniquement en HTTPS (dev: configurer localhost en HTTPS ou flag dev) |
| ✅ Access Token 15min | Fenêtre d'exploitation minimale en cas de vol |
| ✅ Refresh Token 7j | Balance UX (ne pas reconnecter souvent) / sécurité |

## Conséquences

### ✅ Avantages
- **Stateless** : Le backend ne stocke aucune session → scalable horizontalement sans Redis
- **Résistant XSS** : Le Refresh Token est inaccessible au JavaScript malveillant
- **Standard industriel** : JWT est un format ouvert, des librairies existent dans tous les langages

### ⚠️ Compromis
- **Révocation complexe** : Un JWT valide reste valide jusqu'à expiration → implémenter une blacklist pour le logout immédiat si nécessaire
- **Gestion côté client** : Renouvellement automatique à implémenter (intercepteur axios/fetch)

### ❌ Alternatives rejetées
- **Sessions serveur** : Nécessite un store partagé (Redis) dès le premier scaling horizontal
- **JWT en localStorage** : Triviale à voler via XSS — vulnérabilité classique
- **Token unique longue durée** : Si volé, l'attaquant a accès longtemps
