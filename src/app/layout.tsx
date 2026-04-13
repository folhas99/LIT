import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import { getSettings, isSectionEnabled, defaults as settingsDefaults } from "@/lib/settings";

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

  let settings;
  let sections = {
    events: true,
    gallery: true,
    reservations: true,
    about: true,
    contact: true,
  };

  if (!isAdmin) {
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
  }

  return (
    <html lang="pt-PT" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {!isAdmin && <ThemeProvider />}
        {!isAdmin && <Header sections={sections} />}
        <main className={!isAdmin ? "flex-1 pt-16 md:pt-20" : "flex-1"}>
          {children}
        </main>
        {!isAdmin && <Footer settings={settings ?? { ...settingsDefaults }} sections={sections} />}
      </body>
    </html>
  );
}
