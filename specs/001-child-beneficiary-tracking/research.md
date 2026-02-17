# Research: Suivi des Enfants Bénéficiaires

**Branch**: `001-child-beneficiary-tracking`
**Date**: 2026-02-17

## Décisions Techniques

### 1. Stockage des fichiers (photos, documents)

**Decision**: Stockage local sur disque (`uploads/`) avec possibilité de migration vers S3-compatible ultérieurement.

**Rationale**: Pour un déploiement initial au Bénin, le stockage local est le plus simple et ne nécessite pas de service cloud externe. Les fichiers sont servis via un endpoint NestJS statique. La migration vers S3 est possible plus tard en changeant uniquement le service de stockage.

**Alternatives considered**:
- S3/MinIO dès le départ : sur-ingénierie pour le volume initial (quelques milliers de fichiers)
- Base de données (BLOB) : mauvaise performance, augmente la taille de la BDD inutilement

### 2. Authentification

**Decision**: JWT avec access token (15 min) + refresh token (7 jours) stocké en httpOnly cookie.

**Rationale**: Conforme à la constitution (Principe I). Les JWT sont stateless, performants, et bien supportés par NestJS via `@nestjs/jwt` et `@nestjs/passport`. Le refresh token en httpOnly cookie protège contre le XSS.

**Alternatives considered**:
- Sessions serveur : nécessite un store de sessions (Redis), plus complexe pour un premier déploiement
- OAuth2 externe : pas de fournisseur d'identité externe pertinent pour ce contexte

### 3. Upload de fichiers

**Decision**: `@nestjs/platform-express` avec Multer. Validation du type MIME (JPG, PNG, PDF) et de la taille (max 5 Mo) via un pipe personnalisé.

**Rationale**: Multer est intégré nativement dans NestJS/Express, pas de dépendance supplémentaire. La validation côté serveur est conforme à la constitution (Principe I).

**Alternatives considered**:
- Fastify multipart : nécessiterait de changer la plateforme NestJS par défaut
- Upload direct vers S3 (presigned URL) : sur-ingénierie pour le volume initial

### 4. Détection de doublons

**Decision**: Vérification au moment de l'enregistrement basée sur (nom + date de naissance + village). Requête Prisma avec `findFirst` + conditions floues (`contains` insensible à la casse). Retourne un avertissement, pas un blocage.

**Rationale**: Simple et efficace pour le volume initial. Un avertissement permet au volontaire de confirmer si c'est bien un nouvel enfant. Pas besoin d'algorithme de matching complexe.

**Alternatives considered**:
- Algorithme de distance de Levenshtein : trop complexe pour un premier déploiement
- Recherche full-text PostgreSQL : prématuré, à envisager si le volume dépasse 50 000 dossiers

### 5. Sauvegarde locale du formulaire

**Decision**: `localStorage` du navigateur avec sauvegarde automatique toutes les 30 secondes et à chaque changement de champ. Restauration proposée au chargement du formulaire.

**Rationale**: Solution native du navigateur, pas de dépendance. Suffisant pour gérer les pertes de connexion temporaires sur le terrain.

**Alternatives considered**:
- Service Worker + IndexedDB : plus robuste mais sur-ingénierie pour ce besoin
- Sync automatique en arrière-plan : nécessite une gestion de conflits complexe

### 6. Pagination

**Decision**: Pagination par curseur (cursor-based) avec Prisma. Paramètres : `take` (défaut 50), `cursor`, `orderBy`.

**Rationale**: Plus performant que la pagination par offset pour les grands ensembles de données. Prisma le supporte nativement. Conforme à la constitution (Principe IV).

**Alternatives considered**:
- Pagination par offset (`skip/take`) : performance dégradée sur les grandes tables
- Infinite scroll sans pagination serveur : charge trop de données en mémoire

### 7. State management frontend

**Decision**: Pinia (store officiel de Vue.js 3).

**Rationale**: Standard recommandé pour Vue.js 3, API simple, support TypeScript natif, intégré avec Vue DevTools.

**Alternatives considered**:
- Vuex : legacy, remplacé par Pinia
- Composables uniquement : insuffisant pour l'état partagé entre pages (auth, liste enfants)
