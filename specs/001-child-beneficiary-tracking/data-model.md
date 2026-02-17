# Data Model: Suivi des Enfants Bénéficiaires

**Branch**: `001-child-beneficiary-tracking`
**Date**: 2026-02-17

## Schéma Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// Utilisateurs (Administrateurs et Volontaires)
// ============================================

enum Role {
  ADMIN
  VOLUNTEER
}

model User {
  id        String   @id @default(uuid())
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  email     String   @unique
  password  String
  phone     String?
  role      Role     @default(VOLUNTEER)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  surveys Survey[]

  @@map("users")
}

// ============================================
// Enfants Bénéficiaires
// ============================================

enum Gender {
  MALE
  FEMALE
}

enum SponsorshipStatus {
  PENDING
  SPONSORED
  NOT_ELIGIBLE
}

model Child {
  id        String @id @default(uuid())
  reference String @unique // Numéro de référence unique (ex: ANI-2026-0001)

  // Identité
  firstName       String            @map("first_name")
  lastName        String            @map("last_name")
  gender          Gender
  dateOfBirth     DateTime?         @map("date_of_birth")
  approximateAge  Int?              @map("approximate_age")
  placeOfBirth    String?           @map("place_of_birth")
  village         String
  nationality     String            @default("Béninoise")
  familyStatus    String?           @map("family_status")
  siblingsCount   Int               @default(0) @map("siblings_count")

  // Scolarité
  school              String?
  currentGrade        String?  @map("current_grade")
  attendanceFrequency String?  @map("attendance_frequency")
  educationalNeeds    String?  @map("educational_needs")

  // Santé
  generalHealth       String?  @map("general_health")
  vaccinationsUpToDate Boolean @default(false) @map("vaccinations_up_to_date")
  healthIssues        String?  @map("health_issues")

  // Conditions de vie
  housingType         String?  @map("housing_type")
  accessToWater       Boolean  @default(false) @map("access_to_water")
  accessToElectricity Boolean  @default(false) @map("access_to_electricity")
  sufficientFood      Boolean  @default(false) @map("sufficient_food")
  guardianActivity    String?  @map("guardian_activity")

  // Parrainage
  wantsSponsorship      Boolean           @default(false) @map("wants_sponsorship")
  guardianConsent       Boolean           @default(false) @map("guardian_consent")
  sponsorshipComments   String?           @map("sponsorship_comments")
  sponsorshipStatus     SponsorshipStatus @default(PENDING) @map("sponsorship_status")
  sponsorshipStatusDate DateTime?         @map("sponsorship_status_date")

  // Photo principale
  photoUrl String? @map("photo_url")

  // Métadonnées
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  documents Document[]
  surveys   Survey[]
  history   ChildHistory[]

  @@index([lastName, firstName])
  @@index([village])
  @@index([sponsorshipStatus])
  @@index([lastName, dateOfBirth, village]) // Détection de doublons
  @@map("children")
}

// ============================================
// Documents (pièces jointes)
// ============================================

enum DocumentType {
  BIRTH_CERTIFICATE
  SCHOOL_CERTIFICATE
  RECENT_PHOTO
  OTHER
}

model Document {
  id       String       @id @default(uuid())
  type     DocumentType
  fileName String       @map("file_name")
  filePath String       @map("file_path")
  mimeType String       @map("mime_type")
  fileSize Int          @map("file_size") // en octets

  childId String @map("child_id")
  child   Child  @relation(fields: [childId], references: [id], onDelete: Cascade)

  uploadedAt DateTime @default(now()) @map("uploaded_at")

  @@map("documents")
}

// ============================================
// Enquêtes terrain
// ============================================

model Survey {
  id String @id @default(uuid())

  // Volontaire
  volunteerId   String @map("volunteer_id")
  volunteer     User   @relation(fields: [volunteerId], references: [id])
  volunteerName String @map("volunteer_name") // Nom saisi dans le formulaire
  volunteerPhone String @map("volunteer_phone") // Contact téléphone/WhatsApp

  surveyDate DateTime @map("survey_date")

  childId String @map("child_id")
  child   Child  @relation(fields: [childId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")

  @@map("surveys")
}

// ============================================
// Historique des modifications
// ============================================

model ChildHistory {
  id String @id @default(uuid())

  childId   String @map("child_id")
  child     Child  @relation(fields: [childId], references: [id], onDelete: Cascade)

  field    String // Nom du champ modifié
  oldValue String? @map("old_value")
  newValue String? @map("new_value")

  changedAt DateTime @default(now()) @map("changed_at")
  changedBy String   @map("changed_by") // ID de l'utilisateur

  @@index([childId])
  @@map("child_history")
}
```

## Relations

```text
User (1) ──── (N) Survey
Child (1) ──── (N) Document
Child (1) ──── (N) Survey
Child (1) ──── (N) ChildHistory
```

## Validation Rules

| Entité | Champ | Règle |
|--------|-------|-------|
| User | email | Format email valide, unique |
| User | password | Minimum 8 caractères, hashé bcrypt |
| Child | firstName | Requis, 2-100 caractères |
| Child | lastName | Requis, 2-100 caractères |
| Child | gender | MALE ou FEMALE uniquement |
| Child | dateOfBirth / approximateAge | Au moins un des deux requis |
| Child | village | Requis |
| Child | siblingsCount | Entier >= 0 |
| Document | mimeType | image/jpeg, image/png, application/pdf |
| Document | fileSize | Maximum 5 242 880 octets (5 Mo) |
| Survey | surveyDate | Date passée ou aujourd'hui |

## State Transitions

### SponsorshipStatus

```text
PENDING ──→ SPONSORED
PENDING ──→ NOT_ELIGIBLE
NOT_ELIGIBLE ──→ PENDING (réexamen)
```

Chaque transition enregistre la date dans `sponsorshipStatusDate` et crée une entrée dans `ChildHistory`.
