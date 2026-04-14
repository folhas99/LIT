import { MapPin, Clock, Mail, Phone } from "lucide-react";
import { defaults as settingsDefaults } from "@/lib/settings";
import { getLocaleAndSettings } from "@/lib/server-locale";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { buildPageMetadata } from "@/lib/page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("sobre", {
    title: "Sobre",
    description: "Sobre o LIT Coimbra — a tua nova casa.",
  });
}

export default async function SobrePage() {
  let settings;
  let locale: "pt" | "en" = "pt";
  let sections: { id: string; page: string; type: string; content: string; order: number; visible: boolean; spacing: string | null }[] = [];
  try {
    const ctx = await getLocaleAndSettings();
    settings = ctx.settings;
    locale = ctx.locale;
    try {
      sections = await prisma.pageSection.findMany({
        where: { page: "sobre", visible: true },
        orderBy: { order: "asc" },
      });
    } catch { /* table might not exist */ }
  } catch (error) {
    logError("sobre/page", error);
    settings = { ...settingsDefaults };
  }

  const beforeSections = sections.filter((s) => s.order < 0);
  const afterSections = sections.filter((s) => s.order >= 0);

  const t = locale === "en"
    ? {
        heading: "About",
        introStrong: "LIT Coimbra",
        introRest: " is where the night comes to life. A unique atmosphere where music, people and energy meet to create unforgettable nights.",
        body: "Inspired by nature and the essence of nightlife, LIT is your new home in Coimbra. A space decorated with natural elements that creates a welcoming yet vibrant atmosphere.",
        location: "Location",
        hours: "Hours",
        email: "Email",
        phone: "Phone",
      }
    : {
        heading: "Sobre",
        introStrong: "LIT Coimbra",
        introRest: " é o espaço onde a noite ganha vida. Um ambiente único onde a música, as pessoas e a energia se encontram para criar noites inesquecíveis.",
        body: "Inspirado pela natureza e pela essência da vida noturna, o LIT é a tua nova casa em Coimbra. Um espaço decorado com elementos naturais que cria uma atmosfera acolhedora e ao mesmo tempo vibrante.",
        location: "Localização",
        hours: "Horário",
        email: "Email",
        phone: "Telefone",
      };

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      {beforeSections.length > 0 && <SectionRenderer sections={beforeSections} />}
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            {t.heading}
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50" />
        </div>

        {/* About text */}
        <section className="mb-16 animate-fade-in-up">
          <div className="max-w-2xl">
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              {locale === "en" ? "" : "O "}
              <strong className="text-white">{t.introStrong}</strong>
              {t.introRest}
            </p>
            <p className="text-gray-400 leading-relaxed">{t.body}</p>
          </div>
        </section>

        {/* Info cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
          {settings.address && (
            <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors duration-300">
                  <MapPin size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors duration-300" />
                </div>
                <h3 className="text-white font-semibold">{t.location}</h3>
              </div>
              <p className="text-gray-400 text-sm">{settings.address}</p>
            </div>
          )}

          {settings.schedule && (
            <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors duration-300">
                  <Clock size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors duration-300" />
                </div>
                <h3 className="text-white font-semibold">{t.hours}</h3>
              </div>
              <p className="text-gray-400 text-sm">{settings.schedule}</p>
            </div>
          )}

          {settings.email && (
            <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors duration-300">
                  <Mail size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors duration-300" />
                </div>
                <h3 className="text-white font-semibold">{t.email}</h3>
              </div>
              <a href={`mailto:${settings.email}`} className="text-jungle-400 hover:text-neon-green/70 text-sm transition-colors duration-300">
                {settings.email}
              </a>
            </div>
          )}

          {settings.phone && (
            <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors duration-300">
                  <Phone size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors duration-300" />
                </div>
                <h3 className="text-white font-semibold">{t.phone}</h3>
              </div>
              <a href={`tel:${settings.phone}`} className="text-jungle-400 hover:text-neon-green/70 text-sm transition-colors duration-300">
                {settings.phone}
              </a>
            </div>
          )}
        </section>

        {afterSections.length > 0 && <SectionRenderer sections={afterSections} />}
      </div>
    </div>
  );
}
