/**
 * Helpers to invalidate Next.js cache after admin mutations.
 *
 * The public site renders pages from a `Page` + `PageSection` model. After any
 * write in admin we must call `revalidatePath` on the affected URLs so the next
 * public request rebuilds the route.
 */

import { revalidatePath } from "next/cache";

/**
 * System slugs map to fixed top-level URLs.
 * Custom (admin-created) pages live under `/p/<slug>`.
 *
 * Keep this in sync with `src/app/layout.tsx` and `src/app/p/[slug]/page.tsx`.
 */
const SYSTEM_SLUG_PATHS: Record<string, string> = {
  homepage: "/",
  eventos: "/eventos",
  galeria: "/galeria",
  reservas: "/reservas",
  sobre: "/sobre",
  contacto: "/contacto",
};

/** Resolve the public path for a page slug. */
export function pathForSlug(slug: string): string {
  return SYSTEM_SLUG_PATHS[slug] ?? `/p/${slug}`;
}

/**
 * Revalidate the public route for a page slug. Safe to call from any server
 * handler — failures (e.g. if the cache layer rejects the path) are logged and
 * swallowed so admin writes never error because of cache invalidation.
 */
export function revalidatePageBySlug(slug: string): void {
  try {
    revalidatePath(pathForSlug(slug));
  } catch (err) {
    console.warn("[revalidate] failed for slug", slug, err);
  }
}

/**
 * Revalidate every public path. Use after global changes (theme, branding,
 * navigation order) where every page may render differently.
 */
export function revalidateAllPublicPaths(): void {
  try {
    // The root layout (Header) consumes nav data from the Page model, so
    // every route's HTML changes when nav metadata moves.
    revalidatePath("/", "layout");
  } catch (err) {
    console.warn("[revalidate] layout-wide revalidation failed", err);
  }
}
