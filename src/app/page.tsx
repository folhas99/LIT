import { LocalBusinessJsonLd, WebsiteJsonLd } from "@/components/SEO";
import PageRenderer from "@/components/sections/PageRenderer";
import { getSettings, defaults as settingsDefaults } from "@/lib/settings";
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
  const settings = await getSettings().catch(() => ({ ...settingsDefaults }));
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:2999";

  return (
    <>
      <PageRenderer slug="homepage" />

      <LocalBusinessJsonLd
        name={settings.siteName}
        description={settings.siteDescription}
        address={settings.address}
        phone={settings.phone}
        email={settings.email}
        url={baseUrl}
        schedule={settings.schedule}
        instagram={settings.instagram}
        facebook={settings.facebook}
      />
      <WebsiteJsonLd
        name={settings.siteName}
        url={baseUrl}
        description={settings.siteDescription}
      />
    </>
  );
}
