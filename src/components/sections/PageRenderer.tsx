import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/sections/SectionRenderer";
import { getServerLocale } from "@/lib/server-locale";

/**
 * PageRenderer — looks up a Page by slug and renders all of its visible
 * sections via <SectionRenderer />. This is the single entry point used by
 * every public page (system pages have thin wrappers; user-created pages are
 * served by the catch-all /[slug] route).
 *
 * Behaviour:
 * - Page does not exist  → 404
 * - Page is unpublished  → 404 (admins can preview via ?_preview=… handled
 *                                upstream by middleware/cache busting)
 * - Page has no sections → renders an empty fragment (so the route still
 *                          resolves; admins can fix it from the editor)
 */
export default async function PageRenderer({ slug }: { slug: string }) {
  let page: { slug: string; published: boolean } | null = null;
  let sections: Array<{
    id: string;
    page: string;
    type: string;
    content: string;
    order: number;
    visible: boolean;
    spacing: string | null;
  }> = [];

  try {
    page = await prisma.page.findUnique({
      where: { slug },
      select: { slug: true, published: true },
    });
    if (!page || !page.published) {
      notFound();
    }

    sections = await prisma.pageSection.findMany({
      where: { page: slug, visible: true },
      orderBy: { order: "asc" },
    });
  } catch (err) {
    // If the Page table doesn't exist yet (pre-migration) we still try to
    // render whatever PageSection rows exist — that mirrors the legacy
    // behaviour during the migration window.
    if (page === null) {
      try {
        sections = await prisma.pageSection.findMany({
          where: { page: slug, visible: true },
          orderBy: { order: "asc" },
        });
      } catch {
        // Database completely unavailable — let Next handle it.
        throw err;
      }
    }
  }

  const locale = await getServerLocale().catch(() => "pt" as const);
  return <SectionRenderer sections={sections} locale={locale} />;
}
