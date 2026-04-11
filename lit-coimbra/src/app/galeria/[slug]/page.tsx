import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import GalleryGrid from "./GalleryGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await prisma.gallery.findUnique({ where: { slug } });
  if (!gallery) return { title: "Galeria não encontrada" };
  return {
    title: gallery.title,
    description: `Fotos de ${gallery.title} no LIT Coimbra`,
    openGraph: {
      title: gallery.title,
      images: gallery.coverImage ? [gallery.coverImage] : [],
    },
  };
}

export default async function GaleriaSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { order: "asc" } },
      event: { select: { title: true, slug: true } },
    },
  });

  if (!gallery) notFound();

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/galeria"
          className="inline-flex items-center gap-2 text-jungle-400 hover:text-jungle-300 transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} /> Voltar à galeria
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wide">
            {gallery.title}
          </h1>
          <div className="flex items-center gap-4 mt-3 text-gray-400 text-sm">
            <time>{format(new Date(gallery.date), "d MMMM yyyy", { locale: pt })}</time>
            <span>{gallery.photos.length} fotos</span>
            {gallery.event && (
              <Link href={`/eventos/${gallery.event.slug}`} className="text-jungle-400 hover:text-jungle-300">
                {gallery.event.title}
              </Link>
            )}
          </div>
        </div>

        <GalleryGrid photos={gallery.photos} />
      </div>
    </div>
  );
}
