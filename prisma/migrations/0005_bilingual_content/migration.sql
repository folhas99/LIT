-- Bilingual content support: optional English variants of user-facing text.
-- All new columns are nullable; when null, the frontend falls back to the
-- Portuguese original.

ALTER TABLE "Event"
  ADD COLUMN "titleEn" TEXT,
  ADD COLUMN "descriptionEn" TEXT,
  ADD COLUMN "lineupEn" TEXT;

ALTER TABLE "Gallery"
  ADD COLUMN "titleEn" TEXT;
