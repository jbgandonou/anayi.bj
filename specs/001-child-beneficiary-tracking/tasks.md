# Tasks: Suivi des Enfants Bénéficiaires

**Input**: Design documents from `/specs/001-child-beneficiary-tracking/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Tests inclus (constitution exige TDD - Principe III).

**Organization**: Tâches groupées par user story pour permettre l'implémentation et le test indépendants de chaque story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut tourner en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User story associée (US1, US2, US3, US4)
- Chemins de fichiers exacts dans les descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/test/`, `backend/prisma/`
- **Frontend**: `frontend/src/`, `frontend/test/`

---

## Phase 1: Setup

**Purpose**: Initialisation du projet et structure de base

- [ ] T001 Initialiser le monorepo avec `backend/` et `frontend/` à la racine du projet
- [ ] T002 [P] Initialiser le projet NestJS dans `backend/` avec TypeScript (`nest new backend`)
- [ ] T003 [P] Initialiser le projet Vue.js 3 dans `frontend/` avec Vite et TypeScript (`npm create vue@latest`)
- [ ] T004 [P] Configurer ESLint + Prettier avec configuration partagée dans `backend/.eslintrc.js` et `frontend/.eslintrc.js`
- [ ] T005 [P] Créer `backend/.env.example` avec toutes les variables d'environnement documentées
- [ ] T006 [P] Créer `frontend/.env.example` avec `VITE_API_URL`
- [ ] T007 Configurer `.gitignore` à la racine (node_modules, .env, uploads/, dist/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure de base qui DOIT être complète avant toute user story

**CRITICAL**: Aucune user story ne peut commencer avant la fin de cette phase

- [ ] T008 Installer et configurer Prisma dans `backend/` (`npm install prisma @prisma/client`)
- [ ] T009 Créer le schéma Prisma complet dans `backend/prisma/schema.prisma` (modèles User, Child, Document, Survey, ChildHistory, enums Role, Gender, SponsorshipStatus, DocumentType)
- [ ] T010 Créer le module Prisma partagé dans `backend/src/prisma/prisma.module.ts` et `backend/src/prisma/prisma.service.ts`
- [ ] T011 Exécuter la migration initiale (`npx prisma migrate dev --name init`)
- [ ] T012 [P] Créer le seed de la base de données dans `backend/prisma/seed.ts` (admin par défaut: admin@anayi.bj)
- [ ] T013 [P] Configurer le module d'upload de fichiers avec Multer dans `backend/src/common/pipes/file-validation.pipe.ts` (validation type MIME: JPG, PNG, PDF + taille max 5 Mo)
- [ ] T014 [P] Créer les filtres d'exception globaux dans `backend/src/common/filters/http-exception.filter.ts`
- [ ] T015 [P] Configurer CORS dans `backend/src/main.ts` pour autoriser le frontend
- [ ] T016 [P] Installer et configurer axios dans `frontend/src/services/api.ts` (base URL, interceptors JWT)
- [ ] T017 [P] Installer et configurer Pinia dans `frontend/src/main.ts`
- [ ] T018 [P] Installer et configurer Vue Router dans `frontend/src/router/index.ts` (routes vides pour l'instant)
- [ ] T019 [P] Créer le layout principal dans `frontend/src/components/layout/AppLayout.vue` (header, sidebar, contenu)
- [ ] T020 Créer les composants communs dans `frontend/src/components/common/` : `AppButton.vue`, `AppInput.vue`, `AppModal.vue`, `AppPagination.vue`

**Checkpoint**: Infrastructure prête — les user stories peuvent commencer

---

## Phase 3: User Story 4 - Gérer les comptes utilisateurs (Priority: P4 mais prérequis)

**Goal**: Authentification et gestion des comptes — nécessaire avant les autres stories car toutes requièrent un utilisateur connecté

**Independent Test**: Un admin peut créer un volontaire, le volontaire peut se connecter

### Tests for User Story 4

- [ ] T021 [P] [US4] Créer le test e2e d'authentification dans `backend/test/auth.e2e-spec.ts` (login, refresh, logout, accès refusé)
- [ ] T022 [P] [US4] Créer le test e2e de gestion utilisateurs dans `backend/test/users.e2e-spec.ts` (CRUD, activation/désactivation, protection par rôle)

### Implementation for User Story 4

- [ ] T023 [US4] Installer les dépendances auth dans `backend/` (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`)
- [ ] T024 [US4] Créer le module auth dans `backend/src/auth/auth.module.ts` avec JWT strategy dans `backend/src/auth/jwt.strategy.ts`
- [ ] T025 [US4] Créer le service auth dans `backend/src/auth/auth.service.ts` (login, refresh, logout, hashage bcrypt)
- [ ] T026 [US4] Créer les DTOs auth dans `backend/src/auth/dto/` (`login.dto.ts`, `token-response.dto.ts`)
- [ ] T027 [US4] Créer le controller auth dans `backend/src/auth/auth.controller.ts` (POST /auth/login, POST /auth/refresh, POST /auth/logout)
- [ ] T028 [US4] Créer les guards dans `backend/src/auth/guards/` (`jwt-auth.guard.ts`, `roles.guard.ts`)
- [ ] T029 [US4] Créer le module users dans `backend/src/users/users.module.ts`
- [ ] T030 [US4] Créer le service users dans `backend/src/users/users.service.ts` (CRUD, activation/désactivation)
- [ ] T031 [US4] Créer les DTOs users dans `backend/src/users/dto/` (`create-user.dto.ts`, `update-user.dto.ts`)
- [ ] T032 [US4] Créer le controller users dans `backend/src/users/users.controller.ts` (GET /users, POST /users, PATCH /users/:id) avec guard Admin
- [ ] T033 [US4] Créer le store auth dans `frontend/src/stores/auth.store.ts` (login, logout, refresh, état utilisateur)
- [ ] T034 [US4] Créer le service auth frontend dans `frontend/src/services/auth.service.ts` (appels API login, refresh, logout)
- [ ] T035 [US4] Créer la page de connexion dans `frontend/src/pages/LoginPage.vue`
- [ ] T036 [US4] Configurer les guards de navigation dans `frontend/src/router/index.ts` (redirection si non connecté, protection par rôle)
- [ ] T037 [US4] Créer la page de gestion des utilisateurs dans `frontend/src/pages/UsersPage.vue` (liste, création, activation/désactivation — admin uniquement)
- [ ] T038 [US4] Créer le service users frontend dans `frontend/src/services/users.service.ts`

**Checkpoint**: Authentification et gestion des comptes fonctionnels. Un admin peut se connecter, créer un volontaire, le volontaire peut se connecter.

---

## Phase 4: User Story 1 - Enregistrer un enfant bénéficiaire (Priority: P1) MVP

**Goal**: Un volontaire peut enregistrer un enfant complet avec documents

**Independent Test**: Un volontaire connecté remplit le formulaire, uploade 3 documents, soumet, et retrouve l'enfant dans la liste

### Tests for User Story 1

- [ ] T039 [P] [US1] Créer le test e2e d'enregistrement enfant dans `backend/test/children.e2e-spec.ts` (création, validation, upload documents, détection doublons)
- [ ] T040 [P] [US1] Créer le test du composant formulaire dans `frontend/test/components/ChildForm.spec.ts` (validation champs, sauvegarde locale, soumission)

### Implementation for User Story 1

- [ ] T041 [US1] Créer le module children dans `backend/src/children/children.module.ts`
- [ ] T042 [US1] Créer les DTOs children dans `backend/src/children/dto/` (`create-child.dto.ts` avec toutes les validations class-validator)
- [ ] T043 [US1] Créer le service children dans `backend/src/children/children.service.ts` (create avec transaction Prisma : enfant + documents + enquête, détection doublons)
- [ ] T044 [US1] Créer le module documents dans `backend/src/documents/documents.module.ts`
- [ ] T045 [US1] Créer le service documents dans `backend/src/documents/documents.service.ts` (upload fichier, validation, sauvegarde sur disque)
- [ ] T046 [US1] Créer le module surveys dans `backend/src/surveys/surveys.module.ts`
- [ ] T047 [US1] Créer le service surveys dans `backend/src/surveys/surveys.service.ts` (création enquête liée à un enfant)
- [ ] T048 [US1] Créer le controller children dans `backend/src/children/children.controller.ts` (POST /children, POST /children/confirm)
- [ ] T049 [US1] Créer le controller documents dans `backend/src/documents/documents.controller.ts` (POST /children/:childId/documents)
- [ ] T050 [US1] Créer les types TypeScript partagés dans `frontend/src/types/child.ts`, `frontend/src/types/document.ts`, `frontend/src/types/survey.ts`
- [ ] T051 [US1] Créer le service children frontend dans `frontend/src/services/children.service.ts` (appels API create, confirm)
- [ ] T052 [US1] Créer le service documents frontend dans `frontend/src/services/documents.service.ts` (upload)
- [ ] T053 [US1] Créer le composable `frontend/src/composables/useLocalStorage.ts` (sauvegarde automatique formulaire toutes les 30s + changement de champ)
- [ ] T054 [US1] Créer le composant formulaire enfant dans `frontend/src/components/children/ChildForm.vue` (formulaire multi-étapes : identité, scolarité, santé, conditions de vie, parrainage, documents, enquête)
- [ ] T055 [US1] Créer la page d'enregistrement dans `frontend/src/pages/ChildFormPage.vue` (intègre ChildForm + gestion doublons + confirmation)
- [ ] T056 [US1] Ajouter la route `/children/new` dans `frontend/src/router/index.ts`

**Checkpoint**: Un volontaire peut enregistrer un enfant complet avec tous les champs et documents. MVP fonctionnel.

---

## Phase 5: User Story 2 - Consulter et rechercher les dossiers (Priority: P2)

**Goal**: Un utilisateur peut lister, rechercher, filtrer et consulter les dossiers d'enfants

**Independent Test**: Un utilisateur recherche un enfant par nom, filtre par village, et consulte son dossier complet

### Tests for User Story 2

- [ ] T057 [P] [US2] Ajouter les tests e2e de recherche/liste dans `backend/test/children.e2e-spec.ts` (pagination, recherche, filtres, détail)
- [ ] T058 [P] [US2] Créer le test du composant liste dans `frontend/test/components/ChildrenList.spec.ts` (affichage, recherche, pagination)

### Implementation for User Story 2

- [ ] T059 [US2] Ajouter les méthodes de recherche dans `backend/src/children/children.service.ts` (findAll avec pagination curseur, recherche par nom, filtres village/école/statut/sexe)
- [ ] T060 [US2] Ajouter la méthode findOne dans `backend/src/children/children.service.ts` (détail complet avec documents et enquêtes)
- [ ] T061 [US2] Ajouter les endpoints GET dans `backend/src/children/children.controller.ts` (GET /children, GET /children/:id)
- [ ] T062 [US2] Créer les DTOs de recherche dans `backend/src/children/dto/query-children.dto.ts` (cursor, take, search, village, school, sponsorshipStatus, gender, orderBy, order)
- [ ] T063 [US2] Ajouter les méthodes de liste dans `frontend/src/services/children.service.ts` (getAll avec filtres, getById)
- [ ] T064 [US2] Créer le store children dans `frontend/src/stores/children.store.ts` (liste, filtres, pagination, enfant sélectionné)
- [ ] T065 [US2] Créer le composant carte enfant dans `frontend/src/components/children/ChildCard.vue` (photo, nom, village, école, statut parrainage)
- [ ] T066 [US2] Créer le composant barre de recherche/filtres dans `frontend/src/components/children/ChildFilters.vue` (champ recherche, sélecteurs village, école, statut, sexe)
- [ ] T067 [US2] Créer la page liste des enfants dans `frontend/src/pages/ChildrenListPage.vue` (ChildFilters + grille de ChildCard + AppPagination)
- [ ] T068 [US2] Créer la page détail enfant dans `frontend/src/pages/ChildDetailPage.vue` (toutes les infos, documents téléchargeables, historique enquêtes)
- [ ] T069 [US2] Ajouter le controller documents GET dans `backend/src/documents/documents.controller.ts` (GET /documents/:id/download)
- [ ] T070 [US2] Ajouter les routes `/children` et `/children/:id` dans `frontend/src/router/index.ts` (avec lazy loading)

**Checkpoint**: La consultation, la recherche et le détail des dossiers fonctionnent de manière indépendante.

---

## Phase 6: User Story 3 - Gérer les demandes de parrainage (Priority: P3)

**Goal**: Un administrateur peut gérer les statuts de parrainage et voir le tableau de bord

**Independent Test**: Un admin filtre les enfants éligibles au parrainage, change un statut, et vérifie les statistiques

### Tests for User Story 3

- [ ] T071 [P] [US3] Ajouter les tests e2e de parrainage dans `backend/test/children.e2e-spec.ts` (changement statut, historique, restriction rôle)
- [ ] T072 [P] [US3] Créer le test e2e du dashboard dans `backend/test/dashboard.e2e-spec.ts` (statistiques correctes)

### Implementation for User Story 3

- [ ] T073 [US3] Ajouter la méthode updateSponsorshipStatus dans `backend/src/children/children.service.ts` (mise à jour statut + date + entrée historique ChildHistory)
- [ ] T074 [US3] Ajouter l'endpoint PATCH dans `backend/src/children/children.controller.ts` (PATCH /children/:id/sponsorship — admin uniquement)
- [ ] T075 [US3] Créer le module dashboard dans `backend/src/dashboard/dashboard.module.ts`
- [ ] T076 [US3] Créer le service dashboard dans `backend/src/dashboard/dashboard.service.ts` (statistiques : total enfants, par sexe, par statut parrainage, par village, volontaires, enquêtes récentes)
- [ ] T077 [US3] Créer le controller dashboard dans `backend/src/dashboard/dashboard.controller.ts` (GET /dashboard/stats — admin uniquement)
- [ ] T078 [US3] Ajouter la méthode updateSponsorship dans `frontend/src/services/children.service.ts`
- [ ] T079 [US3] Créer le service dashboard frontend dans `frontend/src/services/dashboard.service.ts` (getStats)
- [ ] T080 [US3] Créer la page de gestion du parrainage dans `frontend/src/pages/SponsorshipPage.vue` (liste filtrée enfants éligibles, boutons changement statut)
- [ ] T081 [US3] Créer les composants dashboard dans `frontend/src/components/dashboard/` : `StatCard.vue` (chiffre clé), `VillageChart.vue` (répartition par village), `GenderChart.vue` (répartition par sexe)
- [ ] T082 [US3] Créer la page tableau de bord dans `frontend/src/pages/DashboardPage.vue` (widgets statistiques, graphiques)
- [ ] T083 [US3] Ajouter les routes `/sponsorship` et `/dashboard` dans `frontend/src/router/index.ts` (admin uniquement, lazy loading)

**Checkpoint**: Le parrainage et le tableau de bord fonctionnent. Les 4 stories sont complètes.

---

## Phase 7: Modification de dossiers et historique

**Purpose**: Permettre la modification des dossiers existants avec traçabilité

- [ ] T084 Créer le DTO de mise à jour dans `backend/src/children/dto/update-child.dto.ts` (PartialType de create-child)
- [ ] T085 Ajouter la méthode update dans `backend/src/children/children.service.ts` (comparaison champ par champ + création entrées ChildHistory pour chaque modification)
- [ ] T086 Ajouter l'endpoint PATCH dans `backend/src/children/children.controller.ts` (PATCH /children/:id)
- [ ] T087 Ajouter la méthode getHistory dans `backend/src/children/children.service.ts` (historique des modifications d'un enfant)
- [ ] T088 Ajouter le mode édition dans `frontend/src/pages/ChildFormPage.vue` (chargement des données existantes, soumission en PATCH)
- [ ] T089 Ajouter la section historique dans `frontend/src/pages/ChildDetailPage.vue` (timeline des modifications)
- [ ] T090 Ajouter la route `/children/:id/edit` dans `frontend/src/router/index.ts`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Améliorations transversales affectant toutes les stories

- [ ] T091 [P] Ajouter la validation globale des DTOs dans `backend/src/main.ts` (ValidationPipe avec class-validator)
- [ ] T092 [P] Configurer le logging structuré dans `backend/src/common/interceptors/logging.interceptor.ts` (sans données sensibles — constitution Principe I)
- [ ] T093 [P] Ajouter les tests unitaires des services dans `backend/src/children/children.service.spec.ts`, `backend/src/auth/auth.service.spec.ts`, `backend/src/users/users.service.spec.ts`
- [ ] T094 [P] Créer la page 404 dans `frontend/src/pages/NotFoundPage.vue`
- [ ] T095 [P] Ajouter le responsive design mobile-first sur toutes les pages (formulaire utilisable sur smartphone)
- [ ] T096 Vérifier la couverture de tests (objectif : 80% backend, 60% frontend)
- [ ] T097 Exécuter le quickstart.md : vérification complète du flux (seed → login admin → créer volontaire → login volontaire → enregistrer enfant → consulter → parrainage → dashboard)
- [ ] T098 Sécurité : vérifier qu'aucune donnée sensible n'apparaît dans les logs et les réponses d'erreur
- [ ] T099 Performance : vérifier la pagination sur 10 000 enregistrements, réponse API < 200ms
- [ ] T100 Créer le script de déploiement et la documentation de mise en production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Pas de dépendances — peut commencer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup — BLOQUE toutes les user stories
- **US4 Auth (Phase 3)**: Dépend de Foundational — BLOQUE US1, US2, US3 (tout nécessite un utilisateur connecté)
- **US1 Enregistrement (Phase 4)**: Dépend de US4 — MVP
- **US2 Consultation (Phase 5)**: Dépend de US4, bénéficie de US1 (données à consulter)
- **US3 Parrainage (Phase 6)**: Dépend de US4, bénéficie de US1 et US2
- **Modification (Phase 7)**: Dépend de US1 et US2
- **Polish (Phase 8)**: Dépend de toutes les phases précédentes

### Execution Flow

```text
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US4: Auth) ← BLOQUANT
    ↓
Phase 4 (US1: Enregistrement) ← MVP
    ↓
Phase 5 (US2: Consultation) ←── peut commencer en parallèle avec Phase 6
    ↓                              ↓
Phase 6 (US3: Parrainage)    Phase 7 (Modification)
    ↓                              ↓
         Phase 8 (Polish)
```

### Parallel Opportunities

```bash
# Phase 1 — tous en parallèle après T001 :
T002, T003, T004, T005, T006, T007

# Phase 2 — après T011 :
T012, T013, T014, T015, T016, T017, T018, T019

# Phase 3 — tests en parallèle :
T021, T022
# Backend et frontend en parallèle après auth backend terminé

# Phase 4 — tests en parallèle :
T039, T040
# Modules backend en parallèle : T044, T046

# Phase 5 — tests en parallèle :
T057, T058

# Phase 6 — tests en parallèle :
T071, T072
```

---

## Implementation Strategy

### MVP First (Phase 1 → 2 → 3 → 4)

1. Compléter Phase 1: Setup
2. Compléter Phase 2: Foundational
3. Compléter Phase 3: Auth (US4) — prérequis pour tout
4. Compléter Phase 4: Enregistrement (US1)
5. **STOP et VALIDER** : Un volontaire peut se connecter et enregistrer un enfant complet
6. Déployer le MVP si prêt

### Incremental Delivery

1. Setup + Foundational + Auth → Plateforme fonctionnelle avec connexion
2. + Enregistrement (US1) → MVP (démo possible)
3. + Consultation (US2) → Recherche et consultation des dossiers
4. + Parrainage (US3) → Gestion complète avec dashboard
5. + Modification (Phase 7) → Traçabilité complète
6. + Polish (Phase 8) → Production-ready

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label = lien vers la user story pour traçabilité
- Chaque user story est indépendamment testable
- Vérifier que les tests échouent avant d'implémenter
- Committer après chaque tâche ou groupe logique
- S'arrêter à chaque checkpoint pour valider la story indépendamment
- US4 (Auth) est traitée en Phase 3 car c'est un prérequis technique pour toutes les autres stories
