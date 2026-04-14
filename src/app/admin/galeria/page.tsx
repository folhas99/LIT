"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SkeletonCard } from "@/components/ui/Skeleton";

type Gallery = {
  id: string;
  title: string;
  slug: string;
  date: string;
  coverImage: string | null;
  published: boolean;
  _count?: { photos: number };
};

export default function AdminGaleriaPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGalleries = async () => {
    const res = await fetch("/api/galleries");
    const data = await res.json();
    setGalleries(data);
    setLoading(false);
  };

  useEffect(() => { fetchGalleries(); }, []);

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/galleries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    fetchGalleries();
  };

  const deleteGallery = async (id: string) => {
    if (!confirm("Eliminar esta galeria e todas as fotos?")) return;
    await fetch(`/api/galleries/${id}`, { method: "DELETE" });
    fetchGalleries();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Galeria</h1>
        <Link
          href="/admin/galeria/novo"
          className="flex items-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold rounded-sm transition-colors"
        >
          <Plus size={18} /> Novo Álbum
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <p className="text-gray-500">Nenhum álbum criado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden"
            >
              <div className="relative aspect-video bg-jungle-800">
                {gallery.coverImage && (
                  <Image
                    src={gallery.coverImage}
                    alt={gallery.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm">{gallery.title}</h3>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(gallery.date).toLocaleDateString("pt-PT")} •{" "}
                  {gallery._count?.photos ?? 0} fotos
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => togglePublish(gallery.id, gallery.published)}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                    title={gallery.published ? "Despublicar" : "Publicar"}
                  >
                    {gallery.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <Link
                    href={`/admin/galeria/${gallery.id}`}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </Link>
                  <button
                    onClick={() => deleteGallery(gallery.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
