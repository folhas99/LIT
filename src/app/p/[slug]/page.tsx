import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageRenderer from "@/components/sections/PageRenderer";
import { buildPageMetadata } from "@/lib/page-meta";
import { getServerLocale } from "@/lib/server-locale";

/**
 * Catch-all route for user-created pages. System pages (homepage, sobre, etc.)
 * keep their own dedicated route files at the top level — this catch-all
 * deliberately lives under /p/ to avoid shadowing planned top-level routes.
 *
 * If you'd rather have user pages at the URL root (WordPress-style), move this
 * file to /src/app/[slug]/page.tsx — Next.js will still prefer the more
 * specific system routes, so existing pages won't break.
 *
 * Rendering strategy: `generateStaticParams` prebuilds every published custom
 * page at build time. Admin edits flush the cache via
 * `revalidateAllPublicPaths()` so visitors always see the latest content
 * without paying for SSR on every request. `dynamicParams: true` lets newly
 * created pages render on first hit before the next revalidation.
 */

export const dynamicParams = true;
export const revalidate = 3600;

const SYSTEM_SLUGS_BLOCKED_HERE = new Set([
  "homepage", "eventos", "galeria", "reservas", "sobre", "contacto",
]);

export async function generateStaticParams() {
  try {
    const pages = await prisma.page.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return pages
      .filter((p) => !SYSTEM_SLUGS_BLOCKED_HERE.has(p.slug))
      .map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  if (SYSTEM_SLUGS_BLOCKED_HERE.has(slug)) {
    return {};
  }
  try {
    const locale = await getServerLocale().catch(() => "pt" as const);
    const page = await prisma.page.findUnique({
      where: { slug },
      select: { title: true, titleEn: true, description: true, published: true },
    });
    if (!page || !page.published) return {};
    const title = (locale === "en" && page.titleEn) || page.title;
    return buildPageMetadata(slug, {
      title,
      description: page.description || undefined,
    });
  } catch {
    return {};
  }
}

export default async function CustomPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // System pages have dedicated routes — refuse to render them here so we
  // don't accidentally serve them at two URLs.
  if (SYSTEM_SLUGS_BLOCKED_HERE.has(slug)) {
    notFound();
  }
  return <PageRenderer slug={slug} />;
}
