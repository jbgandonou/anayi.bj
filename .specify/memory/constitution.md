<!-- Sync Impact Report
  Version change: 0.0.0 → 1.0.0 (initial constitution)
  Added principles:
    - I. Sécurité des Données
    - II. Simplicité et Clarté
    - III. Tests Obligatoires (NON-NÉGOCIABLE)
    - IV. Performance
  Added sections:
    - Stack Technique
    - Workflow de Développement
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ compatible
    - .specify/templates/spec-template.md ✅ compatible
    - .specify/templates/tasks-template.md ✅ compatible
  Follow-up TODOs: aucun
-->

# Anayi.bj Constitution

## Core Principles

### I. Sécurité des Données

- Toute donnée personnelle de citoyen bénéficiaire DOIT être chiffrée au repos et en transit.
- L'authentification DOIT utiliser JWT avec refresh tokens et expiration courte.
- Les mots de passe DOIVENT être hashés avec bcrypt (minimum 12 rounds).
- Chaque endpoint API DOIT vérifier l'autorisation via des guards NestJS.
- Les entrées utilisateur DOIVENT être validées côté backend avec class-validator avant tout traitement.
- Les requêtes Prisma DOIVENT utiliser des transactions pour les opérations critiques.
- Les données sensibles (noms, adresses, numéros d'identification) NE DOIVENT JAMAIS apparaître dans les logs.

### II. Simplicité et Clarté

- Le code DOIT être lisible sans commentaire explicatif : noms de variables et fonctions descriptifs.
- Principe YAGNI : ne pas implémenter de fonctionnalité non demandée.
- Chaque module NestJS DOIT avoir une seule responsabilité claire.
- Les composants Vue.js DOIVENT rester sous 200 lignes ; au-delà, refactoriser.
- Les schémas Prisma DOIVENT refléter exactement le domaine métier, sans abstraction superflue.
- Pas de sur-ingénierie : trois lignes similaires valent mieux qu'une abstraction prématurée.

### III. Tests Obligatoires (NON-NÉGOCIABLE)

- Cycle TDD strict : écrire le test, vérifier qu'il échoue, puis implémenter.
- Chaque endpoint API DOIT avoir au minimum un test e2e (supertest + NestJS testing).
- Chaque service NestJS DOIT avoir des tests unitaires couvrant les cas nominaux et d'erreur.
- Les composants Vue.js critiques (formulaires, tableaux de bord) DOIVENT avoir des tests avec Vitest.
- Les migrations Prisma DOIVENT être testées sur une base de données de test avant déploiement.
- Couverture de code minimum : 80% sur le backend, 60% sur le frontend.

### IV. Performance

- Les requêtes API DOIVENT répondre en moins de 200ms (p95) pour les opérations de lecture.
- Les requêtes Prisma DOIVENT utiliser `select` et `include` de manière ciblée, jamais de `findMany` sans pagination.
- Le frontend Vue.js DOIT utiliser le lazy loading pour les routes et les composants lourds.
- Les listes de bénéficiaires DOIVENT être paginées côté serveur (maximum 50 éléments par page par défaut).
- Les assets statiques DOIVENT être mis en cache avec des headers appropriés.

## Stack Technique

- **Frontend** : Vue.js 3 (Composition API) avec TypeScript
- **Backend** : NestJS avec TypeScript
- **ORM** : Prisma avec PostgreSQL
- **Tests backend** : Jest + supertest
- **Tests frontend** : Vitest + Vue Test Utils
- **Validation** : class-validator + class-transformer (backend), Vuelidate ou zod (frontend)
- **Authentification** : JWT (access + refresh tokens)
- **Linter** : ESLint + Prettier (configuration partagée)

## Workflow de Développement

- Chaque fonctionnalité DOIT être développée sur une branche dédiée (`feature/xxx-nom`).
- Chaque PR DOIT passer les tests automatisés et le linting avant merge.
- Les commits DOIVENT suivre la convention Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).
- Le code DOIT être reviewé par au moins un autre développeur avant merge.
- Les migrations de base de données DOIVENT être versionnées et réversibles.
- Le déploiement DOIT suivre le flux : développement -> staging -> production.

## Governance

- Cette constitution prévaut sur toutes les autres pratiques de développement du projet.
- Toute modification de la constitution DOIT être documentée, justifiée et approuvée.
- Les amendements suivent le versionnement sémantique (MAJOR.MINOR.PATCH).
- Chaque PR DOIT vérifier la conformité avec ces principes.
- La complexité ajoutée DOIT être justifiée par un besoin concret et documenté.

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
