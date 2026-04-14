import Hero from "@/components/home/Hero";
import EventsPreview from "@/components/home/EventsPreview";
import GalleryPreview from "@/components/home/GalleryPreview";
import ContactCTA from "@/components/home/ContactCTA";
import NextEventCountdown from "@/components/home/NextEventCountdown";
import SectionRenderer from "@/components/sections/SectionRenderer";
import { LocalBusinessJsonLd, WebsiteJsonLd } from "@/components/SEO";
import { prisma } from "@/lib/prisma";
import { getSettings, isSectionEnabled, defaults as settingsDefaults, pickLocalized } from "@/lib/settings";
import { getLocaleAndSettings } from "@/lib/server-locale";
import { buildPageMetadata } from "@/lib/page-meta";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  return buildPageMetadata("homepage", {
    title: settings?.siteName || "LIT Coimbra",
    description: settings?.siteDescription || "A tua nova casa! Discoteca em Coimbra.",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  let settings;
  let locale: "pt" | "en" = "pt";
  let events: { id: string; title: string; titleEn: string | null; slug: string; date: Date; image: string | null; eventType: string | null }[] = [];
  let galleries: { id: string; title: string; titleEn: string | null; slug: string; coverImage: string | null; date: Date }[] = [];
  let sections: { id: string; page: string; type: string; content: string; order: number; visible: boolean; spacing: string | null }[] = [];

  try {
    const ctx = await getLocaleAndSettings();
    settings = ctx.settings;
    locale = ctx.locale;

    if (isSectionEnabled(settings, "sectionEvents")) {
      events = await prisma.event.findMany({
        where: { published: true, date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 4,
        select: { id: true, title: true, titleEn: true, slug: true, date: true, image: true, eventType: true },
      });
    }

    if (isSectionEnabled(settings, "sectionGallery")) {
      galleries = await prisma.gallery.findMany({
        where: { published: true },
        orderBy: { date: "desc" },
        take: 6,
        select: { id: true, title: true, titleEn: true, slug: true, coverImage: true, date: true },
      });
    }

    // Fetch custom sections for homepage
    try {
      sections = await prisma.pageSection.findMany({
        where: { page: "homepage", visible: true },
        orderBy: { order: "asc" },
      });
    } catch {
      // PageSection table might not exist yet
    }
  } catch {
    settings = { ...settingsDefaults };
  }

  // Apply locale-aware titles to events & galleries before rendering.
  const localizedEvents = events.map((e) => ({
    ...e,
    title: pickLocalized(e, "title", locale),
  }));
  const localizedGalleries = galleries.map((g) => ({
    ...g,
    title: pickLocalized(g, "title", locale),
  }));

  // Separate sections by position: before hero (order < 0), between content (0-99), after content (100+)
  const beforeHero = sections.filter((s) => s.order < 0);
  const middleSections = sections.filter((s) => s.order >= 0 && s.order < 100);
  const afterContent = sections.filter((s) => s.order >= 100);

  return (
    <>
      {beforeHero.length > 0 && <SectionRenderer sections={beforeHero} />}

      <Hero
        title={settings.heroTitle}
        subtitle={settings.heroSubtitle}
        heroImage={settings.heroImage}
        heroVideo={settings.heroVideo}
        showReservations={isSectionEnabled(settings, "sectionReservations")}
      />

      {middleSections.length > 0 && <SectionRenderer sections={middleSections} />}

      {isSectionEnabled(settings, "sectionEvents") && localizedEvents[0] && (
        <NextEventCountdown
          title={localizedEvents[0].title}
          slug={localizedEvents[0].slug}
          date={localizedEvents[0].date}
        />
      )}

      {isSectionEnabled(settings, "sectionEvents") && localizedEvents.length > 0 && (
        <EventsPreview events={localizedEvents} />
      )}

      {isSectionEnabled(settings, "sectionGallery") && localizedGalleries.length > 0 && (
        <GalleryPreview galleries={localizedGalleries} />
      )}

      {isSectionEnabled(settings, "sectionContact") && (
        <ContactCTA
          email={settings.email}
          instagram={settings.instagram}
          facebook={settings.facebook}
        />
      )}

      {afterContent.length > 0 && <SectionRenderer sections={afterContent} />}

      <LocalBusinessJsonLd
        name={settings.siteName}
        description={settings.siteDescription}
        address={settings.address}
        phone={settings.phone}
        email={settings.email}
        url={process.env.NEXTAUTH_URL || "http://localhost:2999"}
        schedule={settings.schedule}
        instagram={settings.instagram}
        facebook={settings.facebook}
      />
      <WebsiteJsonLd
        name={settings.siteName}
        url={process.env.NEXTAUTH_URL || "http://localhost:2999"}
        description={settings.siteDescription}
      />
    </>
  );
}
