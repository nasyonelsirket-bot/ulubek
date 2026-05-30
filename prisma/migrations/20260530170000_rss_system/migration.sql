-- AlterTable: sources - RSS fetch fields
ALTER TABLE "sources" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "sources" ADD COLUMN IF NOT EXISTS "fetchIntervalMinutes" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "sources" ADD COLUMN IF NOT EXISTS "lastFetchedAt" TIMESTAMP(3);
ALTER TABLE "sources" ADD COLUMN IF NOT EXISTS "lastFetchError" TEXT;
ALTER TABLE "sources" ADD COLUMN IF NOT EXISTS "articlesFetched" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: articles - dedup fields
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "contentHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "articles_sourceUrl_key" ON "articles"("sourceUrl");
CREATE UNIQUE INDEX IF NOT EXISTS "articles_sourceId_externalId_key" ON "articles"("sourceId", "externalId");
CREATE INDEX IF NOT EXISTS "articles_contentHash_idx" ON "articles"("contentHash");
CREATE INDEX IF NOT EXISTS "sources_isActive_type_idx" ON "sources"("isActive", "type");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "sources" ADD CONSTRAINT "sources_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: rss_fetch_logs
CREATE TABLE IF NOT EXISTS "rss_fetch_logs" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "status" TEXT NOT NULL,
    "fetched" INTEGER NOT NULL DEFAULT 0,
    "created" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rss_fetch_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "rss_fetch_logs_createdAt_idx" ON "rss_fetch_logs"("createdAt");
