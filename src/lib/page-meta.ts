import type { Metadata } from "next";
import { prisma } from "./prisma";

export type PageMetaData = {
  title: string;
  description: string;
  ogImage: string;
  noIndex: boolean;
};

export const PAGES = [
  "homepage",
  "eventos",
  "galeria",
  "sobre",
  "contacto",
  "reservas",
] as const;

export type PageKey = (typeof PAGES)[number];

export async function getPageMeta(page: PageKey): Promise<PageMetaData | null> {
  try {
    const row = await prisma.pageMeta.findUnique({ where: { page } });
    if (!row) return null;
    return {
      title: row.title || "",
      description: row.description || "",
      ogImage: row.ogImage || "",
      noIndex: row.noIndex,
    };
  } catch {
    return null;
  }
}

export async function getAllPageMeta(): Promise<Record<string, PageMetaData>> {
  try {
    const rows = await prisma.pageMeta.findMany();
    const result: Record<string, PageMetaData> = {};
    for (const row of rows) {
      result[row.page] = {
        title: row.title || "",
        description: row.description || "",
        ogImage: row.ogImage || "",
        noIndex: row.noIndex,
      };
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Build a Next.js Metadata object for a public page.
 * Applies admin-configured overrides on top of defaults.
 */
export async function buildPageMetadata(
  page: PageKey,
  defaults: { title: string; description: string; absoluteTitle?: boolean }
): Promise<Metadata> {
  const meta = await getPageMeta(page);
  const title = meta?.title || defaults.title;
  const description = meta?.description || defaults.description;
  // Fallback to dynamic OG image generator if no admin override set
  const ogImage = meta?.ogImage || `/api/og?page=${page}`;
  const noIndex = meta?.noIndex || false;

  return {
    title: defaults.absoluteTitle ? { absolute: title } : title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

export async function setPageMeta(page: PageKey, data: Partial<PageMetaData>): Promise<void> {
  await prisma.pageMeta.upsert({
    where: { page },
    update: {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      ogImage: data.ogImage ?? undefined,
      noIndex: data.noIndex ?? undefined,
    },
    create: {
      page,
      title: data.title || null,
      description: data.description || null,
      ogImage: data.ogImage || null,
      noIndex: data.noIndex ?? false,
    },
  });
}
