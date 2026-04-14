import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import type { Metadata } from "next";
import GalleriesFilterView from "@/components/gallery/GalleriesFilterView";
import { buildPageMetadata } from "@/lib/page-meta";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocalized } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("galeria", {
    title: "Galeria",
    description: "Fotos das melhores noites no LIT Coimbra.",
  });
}

export default async function GaleriaPage() {
  const locale = await getServerLocale();
  let galleries: Awaited<ReturnType<typeof prisma.gallery.findMany>> = [];
  try {
    galleries = await prisma.gallery.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      include: { _count: { select: { photos: true } } },
    });
  } catch (error) {
    logError("galeria/page", error);
  }

  const serialized = galleries.map((g) => ({
    id: g.id,
    title: pickLocalized(g, "title", locale),
    slug: g.slug,
    date: g.date,
    coverImage: g.coverImage,
    photoCount: (g as unknown as { _count: { photos: number } })._count.photos,
  }));

  const headingTitle = locale === "en" ? "Gallery" : "Galeria";
  const headingSubtitle =
    locale === "en" ? "The best photos of our nights." : "As melhores fotos das nossas noites.";

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            {headingTitle}
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-accent-purple/50" />
          <p className="mt-4 text-gray-400 text-lg">{headingSubtitle}</p>
        </div>

        <GalleriesFilterView galleries={serialized} />
      </div>
    </div>
  );
}
