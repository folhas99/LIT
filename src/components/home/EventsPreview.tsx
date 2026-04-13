import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { ArrowRight, Calendar } from "lucide-react";

type EventPreview = {
  id: string;
  title: string;
  slug: string;
  date: Date;
  image: string | null;
  eventType: string | null;
};

const typeColors: Record<string, string> = {
  wednesday: "bg-accent-blue",
  thursday: "bg-accent-pink",
  friday: "bg-accent-orange",
  saturday: "bg-jungle-600",
  special: "bg-accent-pink",
};

export default function EventsPreview({ events }: { events: EventPreview[] }) {
  if (events.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
              Próximos Eventos
            </h2>
            <div className="mt-2 w-16 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50" />
          </div>
          <Link
            href="/eventos"
            className="hidden sm:flex items-center gap-2 text-jungle-400 hover:text-neon-green transition-colors duration-300 text-sm uppercase tracking-wider"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/eventos/${event.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-jungle-800 card-shine card-glow">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-jungle-700 to-jungle-900" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-jungle-950/90 via-jungle-950/20 to-transparent" />

                {/* Badge */}
                {event.eventType && (
                  <span
                    className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white uppercase tracking-wider rounded-sm ${typeColors[event.eventType] || "bg-jungle-600"}`}
                  >
                    {event.eventType}
                  </span>
                )}

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 text-jungle-300 text-xs mb-2">
                    <Calendar size={12} />
                    <time>
                      {format(new Date(event.date), "d MMM, EEEE", { locale: pt })}
                    </time>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight group-hover:text-neon-green/80 transition-colors duration-300">
                    {event.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/eventos"
          className="sm:hidden flex items-center justify-center gap-2 mt-8 text-jungle-400 hover:text-neon-green transition-colors duration-300 text-sm uppercase tracking-wider"
        >
          Ver todos os eventos <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
