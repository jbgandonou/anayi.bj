# Implementation Plan: Suivi des Enfants Bénéficiaires

**Branch**: `001-child-beneficiary-tracking` | **Date**: 2026-02-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-child-beneficiary-tracking/spec.md`

## Summary

Plateforme web de suivi des enfants bénéficiaires du programme de parrainage Anayi. Les volontaires terrain enregistrent les dossiers des enfants (identité, scolarité, santé, conditions de vie, documents). Les administrateurs gèrent les comptes, consultent les dossiers et suivent les demandes de parrainage. Architecture web séparée : backend NestJS avec Prisma/PostgreSQL, frontend Vue.js 3.

## Technical Context

**Language/Version**: TypeScript 5.x (backend & frontend)
**Primary Dependencies**: NestJS 10.x (backend), Vue.js 3.x Composition API (frontend), Prisma 5.x (ORM)
**Storage**: PostgreSQL 16 (base de données), stockage fichiers local ou S3-compatible (documents/photos)
**Testing**: Jest + supertest (backend), Vitest + Vue Test Utils (frontend)
**Target Platform**: Web (navigateurs modernes, responsive mobile-first)
**Project Type**: Web application (frontend + backend séparés)
**Performance Goals**: API < 200ms p95 lecture, recherche < 2s sur 10k dossiers, tableau de bord < 3s
**Constraints**: Connexion intermittente (sauvegarde locale formulaire), documents max 5 Mo, pagination 50 éléments/page
**Scale/Scope**: ~10 000 bénéficiaires initiaux, ~50 volontaires, ~5 administrateurs, ~10 écrans principaux

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Statut | Détail |
|----------|--------|--------|
| I. Sécurité des Données | PASS | JWT auth, bcrypt passwords, class-validator, guards NestJS, pas de données sensibles dans les logs, chiffrement en transit (HTTPS) |
| II. Simplicité et Clarté | PASS | Architecture simple frontend/backend, modules NestJS par domaine, composants Vue < 200 lignes, schéma Prisma reflète le domaine métier |
| III. Tests Obligatoires | PASS | Jest + supertest pour les endpoints, tests unitaires services NestJS, Vitest pour composants Vue critiques, couverture 80% backend / 60% frontend |
| IV. Performance | PASS | Pagination serveur, select/include Prisma ciblés, lazy loading routes Vue, cache headers assets statiques |

Tous les gates passent. Aucune violation.

## Project Structure

### Documentation (this feature)

```text
specs/001-child-beneficiary-tracking/
├── plan.md              # Ce fichier
├── research.md          # Phase 0 : recherche et décisions techniques
├── data-model.md        # Phase 1 : modèle de données Prisma
├── quickstart.md        # Phase 1 : guide de démarrage rapide
├── contracts/           # Phase 1 : contrats API REST
│   └── api.md
└── tasks.md             # Phase 2 : tâches (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── auth/                  # Module authentification (JWT, guards, strategies)
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── guards/
│   │   └── dto/
│   ├── users/                 # Module gestion utilisateurs (admin, volontaires)
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── children/              # Module enfants bénéficiaires
│   │   ├── children.module.ts
│   │   ├── children.controller.ts
│   │   ├── children.service.ts
│   │   └── dto/
│   ├── documents/             # Module upload et gestion documents
│   │   ├── documents.module.ts
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   └── dto/
│   ├── surveys/               # Module enquêtes terrain
│   │   ├── surveys.module.ts
│   │   ├── surveys.controller.ts
│   │   ├── surveys.service.ts
│   │   └── dto/
│   ├── dashboard/             # Module tableau de bord et statistiques
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts
│   ├── prisma/                # Module Prisma (service partagé)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── common/                # Filtres, interceptors, pipes partagés
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/
│   ├── auth.e2e-spec.ts
│   ├── children.e2e-spec.ts
│   ├── users.e2e-spec.ts
│   └── jest-e2e.json
├── uploads/                   # Stockage local des fichiers uploadés
├── package.json
├── tsconfig.json
└── .env.example

frontend/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/            # Boutons, inputs, modals, pagination
│   │   ├── children/          # Formulaire enfant, carte enfant, liste
│   │   ├── dashboard/         # Widgets statistiques
│   │   └── layout/            # Header, sidebar, footer
│   ├── composables/           # Logique réutilisable (useAuth, useChildren, etc.)
│   ├── pages/
│   │   ├── LoginPage.vue
│   │   ├── DashboardPage.vue
│   │   ├── ChildrenListPage.vue
│   │   ├── ChildDetailPage.vue
│   │   ├── ChildFormPage.vue
│   │   ├── SponsorshipPage.vue
│   │   └── UsersPage.vue
│   ├── router/
│   │   └── index.ts
│   ├── services/              # Appels API (axios)
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── children.service.ts
│   │   ├── documents.service.ts
│   │   └── users.service.ts
│   ├── stores/                # Pinia stores
│   │   ├── auth.store.ts
│   │   └── children.store.ts
│   ├── types/                 # Types TypeScript partagés
│   ├── App.vue
│   └── main.ts
├── test/
│   ├── components/
│   └── setup.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

**Structure Decision**: Architecture web application avec frontend et backend séparés. Le backend NestJS expose une API REST consommée par le frontend Vue.js. Les modules NestJS suivent le découpage par domaine métier (children, users, auth, documents, surveys, dashboard). Le frontend utilise une structure pages/composants/services classique avec Pinia pour le state management.

## Complexity Tracking

> Aucune violation de constitution. Pas de complexité supplémentaire à justifier.
