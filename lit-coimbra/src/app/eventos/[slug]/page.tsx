import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { ArrowLeft, Calendar, Clock, Music, Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return { title: "Evento não encontrado" };
  return {
    title: event.title,
    description: event.description?.slice(0, 160) || `${event.title} no LIT Coimbra`,
    openGraph: {
      title: event.title,
      images: event.image ? [event.image] : [],
    },
  };
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { gallery: { include: { photos: { take: 4 } } } },
  });

  if (!event) notFound();

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 text-jungle-400 hover:text-jungle-300 transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} /> Voltar aos eventos
        </Link>

        {/* Image */}
        {event.image && (
          <div className="relative aspect-video rounded-sm overflow-hidden mb-8 bg-jungle-800">
            <Image
              src={event.image}
              alt={event.title}
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
            {event.title}
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
        {event.lineup && (
          <div className="mb-8 p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
            <h2 className="flex items-center gap-2 text-white font-semibold mb-3">
              <Music size={18} /> Lineup
            </h2>
            <p className="text-gray-300 whitespace-pre-line">{event.lineup}</p>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div
            className="prose prose-invert prose-sm max-w-none mb-12 text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        )}

        {/* Gallery link */}
        {event.gallery && event.gallery.photos.length > 0 && (
          <Link
            href={`/galeria/${event.gallery.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-jungle-800 hover:bg-jungle-700 border border-jungle-600/30 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            <Camera size={18} /> Ver fotos deste evento
          </Link>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 bg-jungle-900/50 border border-jungle-700/30 rounded-sm text-center">
          <p className="text-gray-400 mb-4">Queres garantir o teu lugar?</p>
          <Link
            href="/reservas"
            className="inline-block px-8 py-3 bg-jungle-600 hover:bg-jungle-500 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            Reservar Mesa
          </Link>
        </div>
      </div>
    </div>
  );
}
