-- AI haber motoru alanlari
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "originalTitle" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "originalContent" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "aiProcessed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "aiProcessedAt" TIMESTAMP(3);
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "aiProcessingError" TEXT;

CREATE INDEX IF NOT EXISTS "articles_aiProcessed_idx" ON "articles"("aiProcessed");

-- Mevcut haberleri islenmis say (geriye donuk uyumluluk)
UPDATE "articles" SET "aiProcessed" = true WHERE "aiProcessed" = false AND "sourceId" IS NULL;
