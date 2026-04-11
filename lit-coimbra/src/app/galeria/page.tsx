import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Camera } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Fotos das melhores noites no LIT Coimbra.",
};

export default async function GaleriaPage() {
  const galleries = await prisma.gallery.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            Galeria
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-jungle-500" />
          <p className="mt-4 text-gray-400 text-lg">
            As melhores fotos das nossas noites.
          </p>
        </div>

        {galleries.length === 0 && (
          <div className="text-center py-20">
            <Camera size={48} className="mx-auto text-jungle-600 mb-4" />
            <p className="text-gray-400 text-lg">
              Ainda não há galerias publicadas. Volta em breve!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {galleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/galeria/${gallery.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-jungle-800">
                {gallery.coverImage ? (
                  <Image
                    src={gallery.coverImage}
                    alt={gallery.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
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
                  <h3 className="text-white font-bold text-lg group-hover:text-jungle-300 transition-colors">
                    {gallery.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    {gallery._count.photos} fotos
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
