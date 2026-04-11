import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EventForm from "@/components/admin/EventForm";

function toLocalDatetime(date: Date): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default async function EditEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div>
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-2 text-jungle-400 hover:text-jungle-300 transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-white mb-8">Editar Evento</h1>
      <EventForm
        initialData={{
          id: event.id,
          title: event.title,
          description: event.description || "",
          date: toLocalDatetime(event.date),
          endDate: event.endDate ? toLocalDatetime(event.endDate) : "",
          image: event.image || "",
          lineup: event.lineup || "",
          eventType: event.eventType || "",
          featured: event.featured,
          published: event.published,
        }}
      />
    </div>
  );
}
