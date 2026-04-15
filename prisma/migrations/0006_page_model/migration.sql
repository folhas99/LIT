-- Page model + foreign key from PageSection.page to Page.slug.
-- Seeds the six system pages (homepage, sobre, contacto, reservas, eventos, galeria)
-- before adding the FK so existing PageSection rows remain valid.

CREATE TABLE IF NOT EXISTS "Page" (
    "id"          TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "titleEn"     TEXT,
    "description" TEXT,
    "system"      BOOLEAN NOT NULL DEFAULT false,
    "published"   BOOLEAN NOT NULL DEFAULT true,
    "showInNav"   BOOLEAN NOT NULL DEFAULT false,
    "navLabel"    TEXT,
    "navLabelEn"  TEXT,
    "navOrder"    INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug");
CREATE INDEX IF NOT EXISTS "Page_published_navOrder_idx" ON "Page"("published", "navOrder");

-- Seed the six system pages. gen_random_uuid() produces a stable unique id;
-- each row is upserted by slug so re-running the migration is idempotent.
INSERT INTO "Page" ("id", "slug", "title", "titleEn", "system", "published", "showInNav", "navLabel", "navLabelEn", "navOrder")
VALUES
    (gen_random_uuid()::TEXT, 'homepage', 'Homepage',   'Homepage',     true, true, false, 'Início',    'Home',         0),
    (gen_random_uuid()::TEXT, 'eventos',  'Eventos',    'Events',       true, true, true,  'Eventos',   'Events',       10),
    (gen_random_uuid()::TEXT, 'galeria',  'Galeria',    'Gallery',      true, true, true,  'Galeria',   'Gallery',      20),
    (gen_random_uuid()::TEXT, 'reservas', 'Reservas',   'Reservations', true, true, true,  'Reservas',  'Reservations', 30),
    (gen_random_uuid()::TEXT, 'sobre',    'Sobre',      'About',        true, true, true,  'Sobre',     'About',        40),
    (gen_random_uuid()::TEXT, 'contacto', 'Contacto',   'Contact',      true, true, true,  'Contacto',  'Contact',      50)
ON CONFLICT ("slug") DO NOTHING;

-- Safety net: any pre-existing PageSection.page value that doesn't match a seeded
-- slug gets mapped to a "homepage" placeholder so the FK can be enforced.
INSERT INTO "Page" ("id", "slug", "title", "system", "published")
SELECT gen_random_uuid()::TEXT, ps."page", ps."page", false, false
FROM "PageSection" ps
LEFT JOIN "Page" p ON p."slug" = ps."page"
WHERE p."slug" IS NULL
GROUP BY ps."page"
ON CONFLICT ("slug") DO NOTHING;

ALTER TABLE "PageSection"
    ADD CONSTRAINT "PageSection_page_fkey"
    FOREIGN KEY ("page") REFERENCES "Page"("slug")
    ON DELETE CASCADE ON UPDATE CASCADE;
