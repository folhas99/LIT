import Hero from "@/components/home/Hero";
import EventsPreview from "@/components/home/EventsPreview";
import GalleryPreview from "@/components/home/GalleryPreview";
import ContactCTA from "@/components/home/ContactCTA";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { getSettings, isSectionEnabled, defaults as settingsDefaults } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let settings;
  let events: { id: string; title: string; slug: string; date: Date; image: string | null; eventType: string | null }[] = [];
  let galleries: { id: string; title: string; slug: string; coverImage: string | null; date: Date }[] = [];

  try {
    settings = await getSettings();

    if (isSectionEnabled(settings, "sectionEvents")) {
      events = await prisma.event.findMany({
        where: { published: true, date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 4,
        select: { id: true, title: true, slug: true, date: true, image: true, eventType: true },
      });
    }

    if (isSectionEnabled(settings, "sectionGallery")) {
      galleries = await prisma.gallery.findMany({
        where: { published: true },
        orderBy: { date: "desc" },
        take: 6,
        select: { id: true, title: true, slug: true, coverImage: true, date: true },
      });
    }
  } catch {
    settings = { ...settingsDefaults };
  }

  return (
    <>
      <Hero
        title={settings.heroTitle}
        subtitle={settings.heroSubtitle}
        heroImage={settings.heroImage}
        heroVideo={settings.heroVideo}
        showReservations={isSectionEnabled(settings, "sectionReservations")}
      />

      {isSectionEnabled(settings, "sectionEvents") && events.length > 0 && (
        <EventsPreview events={events} />
      )}

      {isSectionEnabled(settings, "sectionGallery") && galleries.length > 0 && (
        <GalleryPreview galleries={galleries} />
      )}

      {isSectionEnabled(settings, "sectionContact") && (
        <ContactCTA
          email={settings.email}
          instagram={settings.instagram}
          facebook={settings.facebook}
        />
      )}
    </>
  );
}
