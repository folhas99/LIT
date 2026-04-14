import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { ArrowLeft, Calendar, Clock, Music, Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { EventJsonLd } from "@/components/SEO";
import { pickLocalized } from "@/lib/settings";
import { getServerLocale } from "@/lib/server-locale";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let event;
  try {
    event = await prisma.event.findUnique({ where: { slug } });
  } catch { /* ignore */ }
  if (!event) return { title: "Evento não encontrado" };
  const description =
    event.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `${event.title} no LIT Coimbra`;
  const ogImage = event.image || `/api/og?event=${encodeURIComponent(event.slug)}`;
  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getServerLocale();
  let event;
  try {
    event = await prisma.event.findUnique({
      where: { slug },
      include: { gallery: { include: { photos: { take: 4 } } } },
    });
  } catch (error) {
    logError("eventos/[slug]", error);
  }

  if (!event) notFound();

  const title = pickLocalized(event, "title", locale);
  const description = pickLocalized(event, "description", locale);
  const lineup = pickLocalized(event, "lineup", locale);
  const backLabel = locale === "en" ? "Back to events" : "Voltar aos eventos";
  const lineupLabel = locale === "en" ? "Lineup" : "Lineup";
  const viewPhotosLabel = locale === "en" ? "See photos from this event" : "Ver fotos deste evento";
  const ctaText = locale === "en" ? "Want to secure your spot?" : "Queres garantir o teu lugar?";
  const ctaButton = locale === "en" ? "Book a Table" : "Reservar Mesa";

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 text-jungle-400 hover:text-jungle-300 transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} /> {backLabel}
        </Link>

        {/* Image */}
        {event.image && (
          <div className="relative aspect-video rounded-sm overflow-hidden mb-8 bg-jungle-800">
            <Image
              src={event.image}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          {event.eventType && (
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider rounded-sm bg-jungle-600 mb-4">
              {event.eventType}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wide">
            {title}
          </h1>

          <div className="flex flex-wrap gap-4 mt-4 text-gray-400 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <time>{format(new Date(event.date), "d MMMM yyyy, EEEE", { locale: pt })}</time>
            </div>
            {event.endDate && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>
                  {format(new Date(event.date), "HH:mm")} - {format(new Date(event.endDate), "HH:mm")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lineup */}
        {lineup && (
          <div className="mb-8 p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
            <h2 className="flex items-center gap-2 text-white font-semibold mb-3">
              <Music size={18} /> {lineupLabel}
            </h2>
            <p className="text-gray-300 whitespace-pre-line">{lineup}</p>
          </div>
        )}

        {/* Description */}
        {description && (
          <div
            className="prose prose-invert prose-sm max-w-none mb-12 text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {/* Gallery link */}
        {event.gallery && event.gallery.photos.length > 0 && (
          <Link
            href={`/galeria/${event.gallery.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-jungle-800 hover:bg-jungle-700 border border-jungle-600/30 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            <Camera size={18} /> {viewPhotosLabel}
          </Link>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 bg-jungle-900/50 border border-jungle-700/30 rounded-sm text-center">
          <p className="text-gray-400 mb-4">{ctaText}</p>
          <Link
            href="/reservas"
            className="inline-block px-8 py-3 bg-jungle-600 hover:bg-jungle-500 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            {ctaButton}
          </Link>
        </div>
      </div>

      <EventJsonLd
        name={title}
        description={description?.replace(/<[^>]*>/g, "").slice(0, 300) || undefined}
        startDate={new Date(event.date).toISOString()}
        endDate={event.endDate ? new Date(event.endDate).toISOString() : undefined}
        image={event.image || undefined}
        url={`${process.env.NEXTAUTH_URL || "http://localhost:2999"}/eventos/${event.slug}`}
        lineup={lineup ? lineup.split(/[\n,;]+/) : undefined}
        location={{
          name: "LIT Coimbra",
          address: "Coimbra, Portugal",
        }}
        offers={{
          url: `${process.env.NEXTAUTH_URL || "http://localhost:2999"}/reservas`,
        }}
      />
    </div>
  );
}
