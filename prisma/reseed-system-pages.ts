/**
 * Destructive reseed for system pages.
 *
 * Deletes all PageSection rows for the configured system slugs and re-inserts
 * the default layouts from `defaultSectionsFor()` in `./seed.ts`.
 *
 * Use this to apply layout updates to existing installations — the regular
 * `prisma db seed` only seeds sections for empty pages, so it will NOT
 * overwrite content that users may already have edited.
 *
 * Usage:
 *   npx tsx prisma/reseed-system-pages.ts
 *   npx tsx prisma/reseed-system-pages.ts --only=homepage,sobre
 *
 * Flags:
 *   --only=slug1,slug2   Restrict to specific slugs (default: all system slugs)
 *   --dry-run            Print what would change without writing to the DB
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { defaultSectionsFor } from "./seed";

const prisma = new PrismaClient();

const SYSTEM_SLUGS = [
  "homepage",
  "eventos",
  "galeria",
  "reservas",
  "sobre",
  "contacto",
] as const;

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const onlyArg = argv.find((a) => a.startsWith("--only="));
  const only = onlyArg
    ? onlyArg
        .slice("--only=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;
  return { dryRun, only };
}

async function main() {
  const { dryRun, only } = parseArgs(process.argv.slice(2));

  const targets = only
    ? SYSTEM_SLUGS.filter((s) => only.includes(s))
    : [...SYSTEM_SLUGS];

  if (targets.length === 0) {
    console.error("No valid target slugs. Available:", SYSTEM_SLUGS.join(", "));
    process.exit(1);
  }

  console.log(
    `${dryRun ? "[DRY-RUN] " : ""}Reseeding system pages: ${targets.join(", ")}`,
  );

  for (const slug of targets) {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) {
      console.warn(`  /${slug} — page not found, skipping (run the main seed first).`);
      continue;
    }

    const defaults = defaultSectionsFor(slug);
    const existingCount = await prisma.pageSection.count({ where: { page: slug } });

    console.log(
      `  /${slug} — removing ${existingCount} existing section(s), inserting ${defaults.length} default(s).`,
    );

    if (dryRun) continue;

    await prisma.$transaction([
      prisma.pageSection.deleteMany({ where: { page: slug } }),
      ...defaults.map((section) =>
        prisma.pageSection.create({
          data: {
            page: slug,
            type: section.type,
            content: JSON.stringify(section.content),
            spacing: section.spacing ? JSON.stringify(section.spacing) : null,
            order: section.order,
            visible: true,
          },
        }),
      ),
    ]);
  }

  console.log(
    dryRun
      ? "[DRY-RUN] Done. No changes written."
      : "Done. Remember that on-demand revalidation only runs when you save a section in the admin — visit /admin/editor/seccoes and hit save, or rebuild the app, to flush caches.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
