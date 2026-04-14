import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import type { Metadata } from "next";
import GalleriesFilterView from "@/components/gallery/GalleriesFilterView";
import { buildPageMetadata } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("galeria", {
    title: "Galeria",
    description: "Fotos das melhores noites no LIT Coimbra.",
  });
}

export default async function GaleriaPage() {
  let galleries: {
    id: string;
    title: string;
    slug: string;
    date: Date;
    coverImage: string | null;
    _count: { photos: number };
  }[] = [];
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
    title: g.title,
    slug: g.slug,
    date: g.date,
    coverImage: g.coverImage,
    photoCount: g._count.photos,
  }));

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            Galeria
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-accent-purple/50" />
          <p className="mt-4 text-gray-400 text-lg">
            As melhores fotos das nossas noites.
          </p>
        </div>

        <GalleriesFilterView galleries={serialized} />
      </div>
    </div>
  );
}
