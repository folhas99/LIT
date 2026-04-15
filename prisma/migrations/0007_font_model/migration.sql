-- Font model: tracks fonts uploaded through the admin panel. The actual font
-- files live on disk under public/uploads/fonts/. This table stores metadata
-- so the admin can list / rename / delete them and the app can render
-- @font-face rules from a stable source.

CREATE TABLE IF NOT EXISTS "Font" (
    "id"           TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "family"       TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filename"     TEXT NOT NULL,
    "url"          TEXT NOT NULL,
    "format"       TEXT NOT NULL,
    "size"         INTEGER NOT NULL,
    "weight"       INTEGER NOT NULL DEFAULT 400,
    "style"        TEXT NOT NULL DEFAULT 'normal',
    "display"      TEXT NOT NULL DEFAULT 'swap',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Font_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Font_filename_key" ON "Font"("filename");
CREATE INDEX IF NOT EXISTS "Font_family_idx" ON "Font"("family");
