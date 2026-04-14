"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Calendar, Music, Search, X, Star } from "lucide-react";

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  date: Date | string;
  image: string | null;
  lineup: string | null;
  eventType: string | null;
  featured: boolean;
};

const typeColors: Record<string, string> = {
  wednesday: "bg-accent-blue",
  thursday: "bg-accent-pink",
  friday: "bg-accent-orange",
  saturday: "bg-jungle-600",
  special: "bg-accent-pink",
};

type TypeFilter = "all" | "wednesday" | "thursday" | "friday" | "saturday" | "special";

export default function EventsFilterView({ events }: { events: EventListItem[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const now = useMemo(() => new Date(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (typeFilter !== "all" && e.eventType !== typeFilter) return false;
      if (onlyFeatured && !e.featured) return false;
      if (q) {
        const hay = `${e.title} ${e.lineup || ""} ${e.eventType || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, query, typeFilter, onlyFeatured]);

  const upcoming = filtered.filter((e) => new Date(e.date) >= now);
  const past = filtered.filter((e) => new Date(e.date) < now).reverse();

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setOnlyFeatured(false);
  };
  const hasFilters = query || typeFilter !== "all" || onlyFeatured;

  const typeTabs: { id: TypeFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "wednesday", label: "Quarta" },
    { id: "thursday", label: "Quinta" },
    { id: "friday", label: "Sexta" },
    { id: "saturday", label: "Sábado" },
    { id: "special", label: "Especial" },
  ];

  return (
    <>
      {/* Filters bar */}
      <div className="mb-10 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar eventos, artistas..."
            className="w-full pl-10 pr-10 py-3 bg-jungle-900/50 border border-jungle-700/40 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
            aria-label="Pesquisar eventos"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
              aria-label="Limpar pesquisa"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {typeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                  typeFilter === tab.id
                    ? "bg-jungle-600 text-white"
                    : "bg-jungle-900/50 text-gray-400 hover:text-white hover:bg-jungle-800/50"
                }`}
                aria-pressed={typeFilter === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOnlyFeatured((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
              onlyFeatured
                ? "bg-accent-gold text-jungle-950"
                : "bg-jungle-900/50 text-gray-400 hover:text-white hover:bg-jungle-800/50"
            }`}
            aria-pressed={onlyFeatured}
          >
            <Star size={12} /> Destaque
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-gray-400 hover:text-white transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-20">
          <h2 className="text-xl font-semibold text-jungle-400 uppercase tracking-wider mb-8">
            Próximos Eventos <span className="text-gray-500 font-normal text-sm">({upcoming.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {upcoming.map((event) => (
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
                    <h3 className="text-white font-bold text-xl leading-tight group-hover:text-neon-green/80 transition-colors duration-300">
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
            {hasFilters ? "Nenhum evento corresponde aos filtros." : "De momento não há eventos agendados. Volta em breve!"}
          </p>
        </div>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-500 uppercase tracking-wider mb-8">
            Eventos Passados <span className="text-gray-600 font-normal text-sm">({past.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {past.map((event) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-sm overflow-hidden bg-jungle-800 grayscale hover:grayscale-0 transition-all duration-500 card-glow">
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
    </>
  );
}
