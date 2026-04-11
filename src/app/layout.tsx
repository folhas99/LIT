import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getSettings, isSectionEnabled, defaults as settingsDefaults } from "@/lib/settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "LIT Coimbra";
  let siteDescription = "A tua nova casa! Discoteca em Coimbra.";

  try {
    const settings = await getSettings();
    siteName = settings.siteName;
    siteDescription = settings.siteDescription;
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
  let settings;
  let sections = {
    events: true,
    gallery: true,
    reservations: true,
    about: true,
    contact: true,
  };

  try {
    settings = await getSettings();
    sections = {
      events: isSectionEnabled(settings, "sectionEvents"),
      gallery: isSectionEnabled(settings, "sectionGallery"),
      reservations: isSectionEnabled(settings, "sectionReservations"),
      about: isSectionEnabled(settings, "sectionAbout"),
      contact: isSectionEnabled(settings, "sectionContact"),
    };
  } catch {
    settings = { ...settingsDefaults };
  }

  return (
    <html lang="pt-PT" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header sections={sections} />
        <main className="flex-1 pt-16 md:pt-20">{children}</main>
        <Footer settings={settings} sections={sections} />
      </body>
    </html>
  );
}
