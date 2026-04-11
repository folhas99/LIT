import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Calendar, Music } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Próximos eventos e programação do LIT Coimbra.",
};

const typeColors: Record<string, string> = {
  wednesday: "bg-accent-blue",
  thursday: "bg-accent-pink",
  friday: "bg-accent-orange",
  saturday: "bg-jungle-600",
  special: "bg-accent-pink",
};

export default async function EventosPage() {
  const now = new Date();
  const allEvents = await prisma.event.findMany({
    where: { published: true },
    orderBy: { date: "asc" },
  });

  const upcoming = allEvents.filter((e) => new Date(e.date) >= now);
  const past = allEvents.filter((e) => new Date(e.date) < now).reverse();

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            Eventos
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-jungle-500" />
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-20">
            <h2 className="text-xl font-semibold text-jungle-400 uppercase tracking-wider mb-8">
              Próximos Eventos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {upcoming.map((event) => (
                <Link
                  key={event.id}
                  href={`/eventos/${event.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-jungle-800">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-jungle-700 to-jungle-900 flex items-center justify-center">
                        <Music size={48} className="text-jungle-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-jungle-950/90 via-jungle-950/20 to-transparent" />

                    {event.eventType && (
                      <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white uppercase tracking-wider rounded-sm ${typeColors[event.eventType] || "bg-jungle-600"}`}>
                        {event.eventType}
                      </span>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-1.5 text-jungle-300 text-xs mb-2">
                        <Calendar size={12} />
                        <time>{format(new Date(event.date), "d MMMM yyyy, EEEE", { locale: pt })}</time>
                      </div>
                      <h3 className="text-white font-bold text-xl leading-tight group-hover:text-jungle-300 transition-colors">
                        {event.title}
                      </h3>
                      {event.lineup && (
                        <p className="mt-2 text-gray-400 text-sm line-clamp-2">
                          {event.lineup}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {upcoming.length === 0 && (
          <div className="text-center py-20">
            <Music size={48} className="mx-auto text-jungle-600 mb-4" />
            <p className="text-gray-400 text-lg">
              De momento não há eventos agendados. Volta em breve!
            </p>
          </div>
        )}

        {/* Past events */}
        {past.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-500 uppercase tracking-wider mb-8">
              Eventos Passados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {past.map((event) => (
                <Link
                  key={event.id}
                  href={`/eventos/${event.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-square rounded-sm overflow-hidden bg-jungle-800 grayscale hover:grayscale-0 transition-all duration-500">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-jungle-700 to-jungle-900" />
                    )}
                    <div className="absolute inset-0 bg-jungle-950/60 group-hover:bg-jungle-950/40 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-xs text-gray-400">
                        {format(new Date(event.date), "d MMM yyyy", { locale: pt })}
                      </p>
                      <h3 className="text-white font-semibold text-sm mt-1 line-clamp-1">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
