-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "SponsorshipStatus" AS ENUM ('PENDING', 'SPONSORED', 'NOT_ELIGIBLE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BIRTH_CERTIFICATE', 'SCHOOL_CERTIFICATE', 'RECENT_PHOTO', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VOLUNTEER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "approximate_age" INTEGER,
    "place_of_birth" TEXT,
    "village" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Béninoise',
    "family_status" TEXT,
    "siblings_count" INTEGER NOT NULL DEFAULT 0,
    "school" TEXT,
    "current_grade" TEXT,
    "attendance_frequency" TEXT,
    "educational_needs" TEXT,
    "general_health" TEXT,
    "vaccinations_up_to_date" BOOLEAN NOT NULL DEFAULT false,
    "health_issues" TEXT,
    "housing_type" TEXT,
    "access_to_water" BOOLEAN NOT NULL DEFAULT false,
    "access_to_electricity" BOOLEAN NOT NULL DEFAULT false,
    "sufficient_food" BOOLEAN NOT NULL DEFAULT false,
    "guardian_activity" TEXT,
    "wants_sponsorship" BOOLEAN NOT NULL DEFAULT false,
    "guardian_consent" BOOLEAN NOT NULL DEFAULT false,
    "sponsorship_comments" TEXT,
    "sponsorship_status" "SponsorshipStatus" NOT NULL DEFAULT 'PENDING',
    "sponsorship_status_date" TIMESTAMP(3),
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "child_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "volunteer_name" TEXT NOT NULL,
    "volunteer_phone" TEXT NOT NULL,
    "survey_date" TIMESTAMP(3) NOT NULL,
    "child_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_history" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT NOT NULL,

    CONSTRAINT "child_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "children_reference_key" ON "children"("reference");

-- CreateIndex
CREATE INDEX "children_last_name_first_name_idx" ON "children"("last_name", "first_name");

-- CreateIndex
CREATE INDEX "children_village_idx" ON "children"("village");

-- CreateIndex
CREATE INDEX "children_sponsorship_status_idx" ON "children"("sponsorship_status");

-- CreateIndex
CREATE INDEX "children_last_name_date_of_birth_village_idx" ON "children"("last_name", "date_of_birth", "village");

-- CreateIndex
CREATE INDEX "child_history_child_id_idx" ON "child_history"("child_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_history" ADD CONSTRAINT "child_history_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
