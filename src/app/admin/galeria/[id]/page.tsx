import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import GalleryForm from "@/components/admin/GalleryForm";

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: "asc" } } },
  });

  if (!gallery) notFound();

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div>
      <Link
        href="/admin/galeria"
        className="inline-flex items-center gap-2 text-jungle-400 hover:text-jungle-300 transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-white mb-8">Editar Álbum</h1>
      <GalleryForm
        events={events}
        initialData={{
          id: gallery.id,
          title: gallery.title,
          titleEn: gallery.titleEn || "",
          date: new Date(gallery.date).toISOString().split("T")[0],
          eventId: gallery.eventId || "",
          coverImage: gallery.coverImage || "",
          published: gallery.published,
          photos: gallery.photos.map((p) => ({
            id: p.id,
            url: p.url,
            alt: p.alt || "",
            order: p.order,
          })),
        }}
      />
    </div>
  );
}
