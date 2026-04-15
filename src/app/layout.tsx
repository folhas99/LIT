import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { cookies } from "next/headers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ToastProvider from "@/components/ToastProvider";
import { I18nProvider } from "@/components/I18nProvider";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n";
import {
  getSettings,
  getLocalizedSettings,
  isEnglishEnabled,
  isSectionEnabled,
  defaults as settingsDefaults,
} from "@/lib/settings";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "LIT Coimbra";
  let siteDescription = "A tua nova casa! Discoteca em Coimbra.";
  let faviconUrl = "";

  try {
    const settings = await getSettings();
    siteName = settings.siteName;
    siteDescription = settings.siteDescription;
    faviconUrl = settings.faviconUrl || "";
  } catch {
    // DB not available yet, use defaults
  }

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    icons: {
      icon: faviconUrl || "/favicon.ico",
      apple: faviconUrl || "/apple-touch-icon.png",
    },
    openGraph: {
      title: siteName,
      description: siteDescription,
      type: "website",
      locale: "pt_PT",
      siteName: siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  let locale: Locale = cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  let settings;
  let sections = {
    events: true,
    gallery: true,
    reservations: true,
    about: true,
    contact: true,
  };
  let englishEnabled = true;
  let navItems: Array<{ label: string; labelEn?: string | null; href: string }> = [];
  let customFontFamilies: string[] = [];

  try {
    const base = await getSettings();
    englishEnabled = isEnglishEnabled(base);
    if (!englishEnabled) locale = DEFAULT_LOCALE;

    settings = locale === "en" && englishEnabled
      ? await getLocalizedSettings("en")
      : base;

    if (!isAdmin) {
      sections = {
        events: isSectionEnabled(settings, "sectionEvents"),
        gallery: isSectionEnabled(settings, "sectionGallery"),
        reservations: isSectionEnabled(settings, "sectionReservations"),
        about: isSectionEnabled(settings, "sectionAbout"),
        contact: isSectionEnabled(settings, "sectionContact"),
      };

      // Pull nav items from the Page model. Falls back silently if the table
      // isn't migrated yet — Header will use the legacy section toggles.
      try {
        const pages = await prisma.page.findMany({
          where: { published: true, showInNav: true },
          orderBy: { navOrder: "asc" },
          select: { slug: true, title: true, titleEn: true, navLabel: true, navLabelEn: true },
        });
        // System slugs map to fixed top-level URLs; everything else lives under /p/<slug>.
        const systemHref: Record<string, string> = {
          homepage: "/",
          eventos: "/eventos",
          galeria: "/galeria",
          reservas: "/reservas",
          sobre: "/sobre",
          contacto: "/contacto",
        };
        navItems = pages.map((p) => ({
          label: p.navLabel || p.title,
          labelEn: p.navLabelEn || p.titleEn,
          href: systemHref[p.slug] || `/p/${p.slug}`,
        }));
      } catch {
        // Page table missing — leave navItems empty so Header falls back.
      }
    }

    // Expose uploaded font family names to the client so ThemeProvider can
    // skip loading them from Google Fonts. Failure here is non-fatal —
    // ThemeProvider degrades to its previous behaviour.
    try {
      const fonts = await prisma.font.findMany({ select: { family: true } });
      customFontFamilies = Array.from(new Set(fonts.map((f) => f.family)));
    } catch {
      customFontFamilies = [];
    }
  } catch {
    settings = { ...settingsDefaults };
  }

  const htmlLang = locale === "pt" ? "pt-PT" : "en";

  const plausibleDomain = !isAdmin ? settings?.analyticsPlausibleDomain?.trim() : "";
  const plausibleScript =
    settings?.analyticsPlausibleScript?.trim() || "https://plausible.io/js/script.js";

  return (
    <html lang={htmlLang} className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a1f0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* @font-face rules for admin-uploaded custom fonts. */}
        <link rel="stylesheet" href="/api/fonts/stylesheet.css" />
        {/* Expose uploaded font families so ThemeProvider doesn't try to
            load them from Google Fonts. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__LIT_CUSTOM_FONTS__=${JSON.stringify(customFontFamilies)};`,
          }}
        />
        {settings?.faviconUrl && (
          <>
            <link rel="icon" href={settings.faviconUrl} />
            <link rel="shortcut icon" href={settings.faviconUrl} />
            <link rel="apple-touch-icon" href={settings.faviconUrl} />
          </>
        )}
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src={plausibleScript}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider initialLocale={locale} englishEnabled={englishEnabled}>
          <ToastProvider />
          {!isAdmin && (
            <a href="#main-content" className="skip-to-content">
              {locale === "pt" ? "Saltar para o conteúdo" : "Skip to content"}
            </a>
          )}
          {!isAdmin && <ServiceWorkerRegister />}
          {!isAdmin && <ThemeProvider />}
          {!isAdmin && (
            <Header
              sections={sections}
              navItems={navItems}
              scheduleJson={settings?.scheduleHours}
              logoUrl={settings?.logoUrl}
              siteName={settings?.siteName}
              englishEnabled={englishEnabled}
            />
          )}
          <main id="main-content" className={!isAdmin ? "flex-1 pt-16 md:pt-20" : "flex-1"}>
            {children}
          </main>
          {!isAdmin && <Footer settings={settings ?? { ...settingsDefaults }} sections={sections} />}
        </I18nProvider>
      </body>
    </html>
  );
}
