import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import type { Metadata } from "next";
import EventsFilterView from "@/components/events/EventsFilterView";
import { buildPageMetadata } from "@/lib/page-meta";
import { getServerLocale } from "@/lib/server-locale";
import { pickLocalized } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("eventos", {
    title: "Eventos",
    description: "Próximos eventos e programação do LIT Coimbra.",
  });
}

export default async function EventosPage() {
  const locale = await getServerLocale();
  let allEvents: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  try {
    allEvents = await prisma.event.findMany({
      where: { published: true },
      orderBy: { date: "asc" },
    });
  } catch (error) {
    logError("eventos/page", error);
  }

  const serialized = allEvents.map((e) => ({
    id: e.id,
    title: pickLocalized(e, "title", locale),
    slug: e.slug,
    date: e.date,
    image: e.image,
    lineup: pickLocalized(e, "lineup", locale),
    eventType: e.eventType,
    featured: e.featured,
  }));

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            Eventos
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50" />
        </div>

        <EventsFilterView events={serialized} />
      </div>
    </div>
  );
}
