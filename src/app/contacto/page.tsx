import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { getLocaleAndSettings } from "@/lib/server-locale";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/sections/SectionRenderer";
import ContactForm from "./ContactForm";
import ContactMap from "@/components/ContactMap";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { buildPageMetadata } from "@/lib/page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contacto", {
    title: "Contacto",
    description: "Entra em contacto com o LIT Coimbra.",
  });
}

export default async function ContactoPage() {
  let settings;
  let locale: "pt" | "en" = "pt";
  let sections: { id: string; page: string; type: string; content: string; order: number; visible: boolean; spacing: string | null }[] = [];
  try {
    const ctx = await getLocaleAndSettings();
    settings = ctx.settings;
    locale = ctx.locale;
    try {
      sections = await prisma.pageSection.findMany({
        where: { page: "contacto", visible: true },
        orderBy: { order: "asc" },
      });
    } catch { /* table might not exist */ }
  } catch (error) {
    logError("contacto/page", error);
    const { defaults: s } = await import("@/lib/settings");
    settings = { ...s };
  }

  const beforeSections = sections.filter((s) => s.order < 0);
  const afterSections = sections.filter((s) => s.order >= 0);

  const t = locale === "en"
    ? {
        heading: "Contact",
        talkToUs: "Talk to us",
        intro: "Got a question or suggestion? Reach out through the channels below.",
        whereWeAre: "Where we are",
      }
    : {
        heading: "Contacto",
        talkToUs: "Fala connosco",
        intro: "Tens alguma questão ou sugestão? Entra em contacto através dos seguintes meios.",
        whereWeAre: "Onde estamos",
      };

  return (
    <div className="min-h-screen py-12 md:py-20 px-4 relative">
      {beforeSections.length > 0 && <SectionRenderer sections={beforeSections} />}
      {/* Background accents */}
      <div className="absolute top-40 left-0 w-64 h-64 bg-accent-purple/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 right-0 w-48 h-48 bg-neon-green/3 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            {t.heading}
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-6">
              {t.talkToUs}
            </h2>
            <p className="text-gray-400 mb-8">{t.intro}</p>

            <div className="space-y-4">
              {settings.email && (
                <div className="flex items-center gap-3 p-3 rounded-sm hover:bg-jungle-900/50 transition-colors duration-300 group">
                  <div className="w-8 h-8 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors duration-300">
                    <Mail size={16} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors duration-300" />
                  </div>
                  <a href={`mailto:${settings.email}`} className="text-gray-300 hover:text-white transition-colors duration-300">
                    {settings.email}
                  </a>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-3 p-3 rounded-sm hover:bg-jungle-900/50 transition-colors duration-300 group">
                  <div className="w-8 h-8 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors duration-300">
                    <Phone size={16} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors duration-300" />
                  </div>
                  <a href={`tel:${settings.phone}`} className="text-gray-300 hover:text-white transition-colors duration-300">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.address && (
                <div className="flex items-center gap-3 p-3 rounded-sm hover:bg-jungle-900/50 transition-colors duration-300 group">
                  <div className="w-8 h-8 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors duration-300">
                    <MapPin size={16} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors duration-300" />
                  </div>
                  <span className="text-gray-300">{settings.address}</span>
                </div>
              )}
            </div>

            {/* Social */}
            <div className="flex gap-4 mt-8">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-pink hover:border-accent-pink social-icon-hover hover:shadow-[0_0_15px_rgba(232,67,147,0.15)]"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={20} />
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-blue hover:border-accent-blue social-icon-hover hover:shadow-[0_0_15px_rgba(9,132,227,0.15)]"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <ContactForm />
          </div>
        </div>

        {/* Map */}
        {(() => {
          const lat = parseFloat(settings.mapLatitude || "");
          const lng = parseFloat(settings.mapLongitude || "");
          if (!isFinite(lat) || !isFinite(lng)) return null;
          return (
            <div className="mt-16 animate-fade-in-up">
              <h2 className="text-xl font-semibold text-jungle-400 uppercase tracking-wider mb-4">
                {t.whereWeAre}
              </h2>
              <ContactMap lat={lat} lng={lng} label={settings.siteName || "LIT Coimbra"} />
            </div>
          );
        })()}

        {afterSections.length > 0 && <SectionRenderer sections={afterSections} />}
      </div>
    </div>
  );
}
