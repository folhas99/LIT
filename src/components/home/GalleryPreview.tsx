import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { ArrowRight } from "lucide-react";

type GalleryPreview = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  date: Date;
};

export default function GalleryPreview({
  galleries,
}: {
  galleries: GalleryPreview[];
}) {
  if (galleries.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-4 bg-jungle-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
              Galeria
            </h2>
            <div className="mt-2 w-16 h-0.5 bg-gradient-to-r from-jungle-500 to-accent-purple/50" />
          </div>
          <Link
            href="/galeria"
            className="hidden sm:flex items-center gap-2 text-jungle-400 hover:text-neon-green transition-colors duration-300 text-sm uppercase tracking-wider"
          >
            Ver tudo <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 stagger-children">
          {galleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/galeria/${gallery.slug}`}
              className="group relative aspect-square overflow-hidden rounded-sm bg-jungle-800 card-shine card-glow"
            >
              {gallery.coverImage ? (
                <Image
                  src={gallery.coverImage}
                  alt={gallery.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-jungle-700 to-jungle-900" />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-jungle-950/0 group-hover:bg-jungle-950/70 transition-colors duration-300 flex items-end">
                <div className="p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-xs text-jungle-300 mb-1">
                    {format(new Date(gallery.date), "d MMM yyyy", {
                      locale: pt,
                    })}
                  </p>
                  <h3 className="text-white font-semibold text-sm md:text-base">
                    {gallery.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/galeria"
          className="sm:hidden flex items-center justify-center gap-2 mt-8 text-jungle-400 hover:text-neon-green transition-colors duration-300 text-sm uppercase tracking-wider"
        >
          Ver galeria completa <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
