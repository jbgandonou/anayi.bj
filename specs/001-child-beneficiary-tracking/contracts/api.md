# API Contracts: Suivi des Enfants Bénéficiaires

**Branch**: `001-child-beneficiary-tracking`
**Date**: 2026-02-17
**Base URL**: `/api/v1`

## Authentification

### POST /auth/login

Connexion utilisateur.

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**:
```json
{
  "accessToken": "string",
  "user": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "ADMIN | VOLUNTEER"
  }
}
```
*Note: Le refresh token est envoyé via cookie httpOnly.*

**Response 401**: `{ "message": "Identifiants invalides" }`

### POST /auth/refresh

Renouveler l'access token via le refresh token (cookie).

**Response 200**: `{ "accessToken": "string" }`
**Response 401**: `{ "message": "Refresh token invalide ou expiré" }`

### POST /auth/logout

Déconnexion (supprime le cookie refresh token).

**Response 200**: `{ "message": "Déconnexion réussie" }`

---

## Utilisateurs (Admin uniquement)

### GET /users

Liste des utilisateurs avec pagination.

**Query Parameters**: `page`, `limit` (défaut 50), `role`, `isActive`

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "role": "ADMIN | VOLUNTEER",
      "isActive": true,
      "createdAt": "ISO8601"
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 50
}
```

### POST /users

Créer un utilisateur.

**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "role": "ADMIN | VOLUNTEER"
}
```

**Response 201**: L'utilisateur créé (sans le mot de passe).
**Response 409**: `{ "message": "Cet email est déjà utilisé" }`

### PATCH /users/:id

Modifier un utilisateur (activer/désactiver, changer le rôle).

**Request Body** (partiel):
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "role": "ADMIN | VOLUNTEER",
  "isActive": true
}
```

**Response 200**: L'utilisateur mis à jour.

---

## Enfants Bénéficiaires

### GET /children

Liste des enfants avec pagination, recherche et filtres.

**Query Parameters**:
- `cursor` (uuid, pour la pagination par curseur)
- `take` (défaut 50)
- `search` (recherche nom/prénom)
- `village` (filtre par village)
- `school` (filtre par école)
- `sponsorshipStatus` (PENDING | SPONSORED | NOT_ELIGIBLE)
- `gender` (MALE | FEMALE)
- `orderBy` (createdAt | lastName | village, défaut createdAt)
- `order` (asc | desc, défaut desc)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "reference": "ANI-2026-0001",
      "firstName": "string",
      "lastName": "string",
      "gender": "MALE | FEMALE",
      "village": "string",
      "school": "string",
      "sponsorshipStatus": "PENDING",
      "photoUrl": "string",
      "createdAt": "ISO8601"
    }
  ],
  "nextCursor": "uuid | null",
  "total": 0
}
```

### GET /children/:id

Détail complet d'un enfant avec documents et enquêtes.

**Response 200**:
```json
{
  "id": "uuid",
  "reference": "ANI-2026-0001",
  "firstName": "string",
  "lastName": "string",
  "gender": "MALE",
  "dateOfBirth": "ISO8601",
  "approximateAge": null,
  "placeOfBirth": "string",
  "village": "string",
  "nationality": "Béninoise",
  "familyStatus": "string",
  "siblingsCount": 3,
  "school": "string",
  "currentGrade": "string",
  "attendanceFrequency": "string",
  "educationalNeeds": "string",
  "generalHealth": "string",
  "vaccinationsUpToDate": true,
  "healthIssues": null,
  "housingType": "string",
  "accessToWater": true,
  "accessToElectricity": false,
  "sufficientFood": true,
  "guardianActivity": "string",
  "wantsSponsorship": true,
  "guardianConsent": true,
  "sponsorshipComments": "string",
  "sponsorshipStatus": "PENDING",
  "sponsorshipStatusDate": null,
  "photoUrl": "string",
  "documents": [
    {
      "id": "uuid",
      "type": "BIRTH_CERTIFICATE",
      "fileName": "acte-naissance.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 245000,
      "uploadedAt": "ISO8601"
    }
  ],
  "surveys": [
    {
      "id": "uuid",
      "volunteerName": "string",
      "volunteerPhone": "string",
      "surveyDate": "ISO8601"
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### POST /children

Enregistrer un nouvel enfant (avec enquête associée).

**Request Body** (multipart/form-data):
```json
{
  "firstName": "string (requis)",
  "lastName": "string (requis)",
  "gender": "MALE | FEMALE (requis)",
  "dateOfBirth": "ISO8601 (optionnel)",
  "approximateAge": "number (optionnel)",
  "placeOfBirth": "string",
  "village": "string (requis)",
  "nationality": "string",
  "familyStatus": "string",
  "siblingsCount": "number",
  "school": "string",
  "currentGrade": "string",
  "attendanceFrequency": "string",
  "educationalNeeds": "string",
  "generalHealth": "string",
  "vaccinationsUpToDate": "boolean",
  "healthIssues": "string",
  "housingType": "string",
  "accessToWater": "boolean",
  "accessToElectricity": "boolean",
  "sufficientFood": "boolean",
  "guardianActivity": "string",
  "wantsSponsorship": "boolean",
  "guardianConsent": "boolean",
  "sponsorshipComments": "string",
  "volunteerName": "string (requis)",
  "volunteerPhone": "string (requis)",
  "surveyDate": "ISO8601 (requis)",
  "photo": "File",
  "birthCertificate": "File",
  "schoolCertificate": "File"
}
```

**Response 201**: L'enfant créé avec son numéro de référence.

**Response 200 (doublon potentiel)**:
```json
{
  "warning": "Doublon potentiel détecté",
  "duplicates": [
    {
      "id": "uuid",
      "reference": "ANI-2026-0001",
      "firstName": "string",
      "lastName": "string",
      "village": "string"
    }
  ],
  "confirmationRequired": true
}
```

### POST /children/confirm

Confirmer l'enregistrement après avertissement de doublon.

**Request Body**: Même que POST /children + `"forceCreate": true`

**Response 201**: L'enfant créé.

### PATCH /children/:id

Modifier un dossier existant (crée une entrée dans l'historique).

**Request Body**: Champs partiels à modifier.

**Response 200**: L'enfant mis à jour.

### PATCH /children/:id/sponsorship

Modifier le statut de parrainage (Admin uniquement).

**Request Body**:
```json
{
  "sponsorshipStatus": "PENDING | SPONSORED | NOT_ELIGIBLE"
}
```

**Response 200**: L'enfant avec le statut mis à jour et la date de changement.

---

## Documents

### POST /children/:childId/documents

Uploader un document pour un enfant.

**Request Body** (multipart/form-data):
- `file`: Fichier (JPG, PNG, PDF, max 5 Mo)
- `type`: `BIRTH_CERTIFICATE | SCHOOL_CERTIFICATE | RECENT_PHOTO | OTHER`

**Response 201**: Le document créé.
**Response 400**: `{ "message": "Format non supporté" }` ou `{ "message": "Fichier trop volumineux (max 5 Mo)" }`

### GET /documents/:id/download

Télécharger un document.

**Response 200**: Le fichier binaire avec les headers Content-Type et Content-Disposition.

### DELETE /documents/:id

Supprimer un document (Admin uniquement).

**Response 204**: Aucun contenu.

---

## Tableau de bord

### GET /dashboard/stats

Statistiques globales (Admin uniquement).

**Response 200**:
```json
{
  "totalChildren": 0,
  "byGender": {
    "MALE": 0,
    "FEMALE": 0
  },
  "bySponsorshipStatus": {
    "PENDING": 0,
    "SPONSORED": 0,
    "NOT_ELIGIBLE": 0
  },
  "byVillage": [
    { "village": "string", "count": 0 }
  ],
  "recentRegistrations": 0,
  "totalVolunteers": 0,
  "totalSurveys": 0
}
```

---

## Codes d'erreur communs

| Code | Signification |
|------|---------------|
| 400 | Données invalides (validation échouée) |
| 401 | Non authentifié |
| 403 | Accès interdit (rôle insuffisant) |
| 404 | Ressource non trouvée |
| 409 | Conflit (doublon email, etc.) |
| 413 | Fichier trop volumineux |
| 500 | Erreur serveur interne |
