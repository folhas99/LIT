-- Add publishAt to Event, Gallery, PageSection
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "publishAt" TIMESTAMP(3);
ALTER TABLE "Gallery" ADD COLUMN IF NOT EXISTS "publishAt" TIMESTAMP(3);
ALTER TABLE "PageSection" ADD COLUMN IF NOT EXISTS "publishAt" TIMESTAMP(3);

-- Add blurDataUrl to Photo
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "blurDataUrl" TEXT;

-- Indexes for Event
CREATE INDEX IF NOT EXISTS "Event_date_idx" ON "Event"("date");
CREATE INDEX IF NOT EXISTS "Event_published_date_idx" ON "Event"("published", "date");
CREATE INDEX IF NOT EXISTS "Event_featured_date_idx" ON "Event"("featured", "date");

-- Indexes for Gallery
CREATE INDEX IF NOT EXISTS "Gallery_published_date_idx" ON "Gallery"("published", "date");

-- Indexes for Photo
CREATE INDEX IF NOT EXISTS "Photo_galleryId_order_idx" ON "Photo"("galleryId", "order");

-- Indexes for ContactMessage
CREATE INDEX IF NOT EXISTS "ContactMessage_read_createdAt_idx" ON "ContactMessage"("read", "createdAt");

-- ActivityLog table
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "userName" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "ActivityLog_entity_entityId_idx" ON "ActivityLog"("entity", "entityId");
