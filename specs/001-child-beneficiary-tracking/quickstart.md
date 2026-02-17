# Quickstart: Suivi des Enfants Bénéficiaires

**Branch**: `001-child-beneficiary-tracking`
**Date**: 2026-02-17

## Prérequis

- Node.js 20+ et npm
- PostgreSQL 16+
- Git

## Installation

### 1. Cloner et accéder au projet

```bash
git clone <repo-url> anayi.bj
cd anayi.bj
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres PostgreSQL
```

Contenu minimum du `.env` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/anayi_db"
JWT_SECRET="votre-secret-jwt-unique"
JWT_REFRESH_SECRET="votre-secret-refresh-unique"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
PORT=3000
```

```bash
# Créer la base de données
npx prisma migrate dev --name init

# Seed (admin par défaut)
npx prisma db seed

# Lancer le serveur
npm run start:dev
```

Le backend est accessible sur `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Éditer .env si nécessaire
```

Contenu du `.env` :

```env
VITE_API_URL=http://localhost:3000/api/v1
```

```bash
npm run dev
```

Le frontend est accessible sur `http://localhost:5173`.

### 4. Compte administrateur par défaut

Après le seed :

- **Email** : admin@anayi.bj
- **Mot de passe** : changez-moi-immédiatement

## Vérification rapide

1. Ouvrir `http://localhost:5173` dans le navigateur
2. Se connecter avec le compte admin
3. Créer un volontaire via la page Utilisateurs
4. Se déconnecter et se reconnecter en tant que volontaire
5. Enregistrer un enfant bénéficiaire via le formulaire
6. Vérifier que l'enfant apparaît dans la liste
7. Se reconnecter en admin et consulter le tableau de bord

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Backend en mode développement (hot reload) |
| `npm run test` | Lancer les tests unitaires |
| `npm run test:e2e` | Lancer les tests end-to-end |
| `npx prisma studio` | Interface visuelle de la base de données |
| `npx prisma migrate dev` | Appliquer les migrations |
| `npm run dev` | Frontend en mode développement |
| `npm run test` | Tests frontend (Vitest) |
| `npm run build` | Build de production frontend |
