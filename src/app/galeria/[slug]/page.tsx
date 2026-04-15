import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { enUS } from "date-fns/locale/en-US";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import type { Metadata } from "next";
import GalleryGrid from "./GalleryGrid";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocalized } from "@/lib/settings";

// ISR: prebuild every published gallery, revalidate hourly.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const galleries = await prisma.gallery.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return galleries.map((g) => ({ slug: g.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let gallery;
  try {
    gallery = await prisma.gallery.findUnique({ where: { slug } });
  } catch { /* ignore */ }
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
  const locale = await getServerLocale();
  let gallery;
  try {
    gallery = await prisma.gallery.findUnique({
      where: { slug },
      include: {
        photos: { orderBy: { order: "asc" } },
        event: { select: { title: true, titleEn: true, slug: true } },
      },
    });
  } catch (error) {
    logError("galeria/[slug]", error);
  }

  if (!gallery) notFound();

  const title = pickLocalized(gallery, "title", locale);
  const eventTitle = gallery.event
    ? pickLocalized(gallery.event, "title", locale)
    : null;
  const backLabel = locale === "en" ? "Back to gallery" : "Voltar à galeria";
  const photosLabel =
    locale === "en"
      ? `${gallery.photos.length} photos`
      : `${gallery.photos.length} fotos`;
  const dateLocale = locale === "en" ? enUS : pt;

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/galeria"
          className="inline-flex items-center gap-2 text-jungle-400 hover:text-jungle-300 transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} /> {backLabel}
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wide">
            {title}
          </h1>
          <div className="flex items-center gap-4 mt-3 text-gray-400 text-sm">
            <time>{format(new Date(gallery.date), "d MMMM yyyy", { locale: dateLocale })}</time>
            <span>{photosLabel}</span>
            {gallery.event && (
              <Link href={`/eventos/${gallery.event.slug}`} className="text-jungle-400 hover:text-jungle-300">
                {eventTitle}
              </Link>
            )}
          </div>
        </div>

        <GalleryGrid photos={gallery.photos} />
      </div>
    </div>
  );
}
