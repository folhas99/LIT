import { MapPin, Clock, Mail, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Sobre o LIT Coimbra — a tua nova casa.",
};

export default async function SobrePage() {
  let settings;
  let sections: { id: string; page: string; type: string; content: string; order: number; visible: boolean; spacing: string | null }[] = [];
  try {
    settings = await getSettings();
    try {
      sections = await prisma.pageSection.findMany({
        where: { page: "sobre", visible: true },
        orderBy: { order: "asc" },
      });
    } catch { /* table might not exist */ }
  } catch (error) {
    logError("sobre/page", error);
    settings = {
      siteName: "LIT Coimbra",
      siteDescription: "A tua nova casa! Discoteca em Coimbra.",
      address: "Coimbra, Portugal",
      phone: "",
      email: "info@litcoimbra.pt",
      instagram: "https://www.instagram.com/lit.coimbra/",
      facebook: "",
      tiktok: "",
      schedule: "Quarta a Sabado, 23:00 - 06:00",
      heroTitle: "LIT Coimbra",
      heroSubtitle: "A tua nova casa",
      heroImage: "",
      heroVideo: "",
      sectionEvents: "true",
      sectionGallery: "true",
      sectionReservations: "true",
      sectionAbout: "true",
      sectionContact: "true",
    };
  }

  const beforeSections = sections.filter((s) => s.order < 0);
  const afterSections = sections.filter((s) => s.order >= 0);

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      {beforeSections.length > 0 && <SectionRenderer sections={beforeSections} />}
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            Sobre
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50" />
        </div>

        {/* About text */}
        <section className="mb-16 animate-fade-in-up">
          <div className="max-w-2xl">
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              O <strong className="text-white">LIT Coimbra</strong> e o espaco onde a noite ganha vida.
              Um ambiente unico onde a musica, as pessoas e a energia se encontram para criar noites inesqueciveis.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Inspirado pela natureza e pela essencia da vida noturna, o LIT e a tua nova casa
              em Coimbra. Um espaco decorado com elementos naturais que cria uma atmosfera
              acolhedora e ao mesmo tempo vibrante.
            </p>
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
                <h3 className="text-white font-semibold">Localizacao</h3>
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
                <h3 className="text-white font-semibold">Horario</h3>
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
                <h3 className="text-white font-semibold">Email</h3>
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
                <h3 className="text-white font-semibold">Telefone</h3>
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
