"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Camera, Search, X } from "lucide-react";

export type GalleryListItem = {
  id: string;
  title: string;
  slug: string;
  date: Date | string;
  coverImage: string | null;
  photoCount: number;
};

export default function GalleriesFilterView({ galleries }: { galleries: GalleryListItem[] }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>("all");

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const g of galleries) set.add(new Date(g.date).getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [galleries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return galleries.filter((g) => {
      if (year !== "all" && String(new Date(g.date).getFullYear()) !== year) return false;
      if (q && !g.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [galleries, query, year]);

  return (
    <>
      <div className="mb-10 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar álbuns..."
            className="w-full pl-10 pr-10 py-3 bg-jungle-900/50 border border-jungle-700/40 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
            aria-label="Pesquisar álbuns"
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

        {years.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setYear("all")}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                year === "all" ? "bg-jungle-600 text-white" : "bg-jungle-900/50 text-gray-400 hover:text-white hover:bg-jungle-800/50"
              }`}
            >
              Todos
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(String(y))}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                  year === String(y) ? "bg-jungle-600 text-white" : "bg-jungle-900/50 text-gray-400 hover:text-white hover:bg-jungle-800/50"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Camera size={48} className="mx-auto text-jungle-600 mb-4" />
          <p className="text-gray-400 text-lg">
            {query || year !== "all" ? "Nenhum álbum corresponde." : "Ainda não há galerias publicadas. Volta em breve!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filtered.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/galeria/${gallery.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-jungle-800 card-shine card-glow">
                {gallery.coverImage ? (
                  <Image
                    src={gallery.coverImage}
                    alt={gallery.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-jungle-700 to-jungle-900 flex items-center justify-center">
                    <Camera size={40} className="text-jungle-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-jungle-950/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs text-jungle-300 mb-1">
                    {format(new Date(gallery.date), "d MMMM yyyy", { locale: pt })}
                  </p>
                  <h3 className="text-white font-bold text-lg group-hover:text-neon-green/80 transition-colors duration-300">
                    {gallery.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    {gallery.photoCount} fotos
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
