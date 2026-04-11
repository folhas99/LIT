import { MapPin, Clock, Mail, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Sobre o LIT Coimbra — a tua nova casa.",
};

export default async function SobrePage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            Sobre
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-jungle-500" />
        </div>

        {/* About text */}
        <section className="mb-16">
          <div className="max-w-2xl">
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              O <strong className="text-white">LIT Coimbra</strong> é o espaço onde a noite ganha vida.
              Um ambiente único onde a música, as pessoas e a energia se encontram para criar noites inesquecíveis.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Inspirado pela natureza e pela essência da vida noturna, o LIT é a tua nova casa
              em Coimbra. Um espaço decorado com elementos naturais que cria uma atmosfera
              acolhedora e ao mesmo tempo vibrante.
            </p>
          </div>
        </section>

        {/* Info cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.address && (
            <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center">
                  <MapPin size={18} className="text-jungle-400" />
                </div>
                <h3 className="text-white font-semibold">Localização</h3>
              </div>
              <p className="text-gray-400 text-sm">{settings.address}</p>
            </div>
          )}

          {settings.schedule && (
            <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center">
                  <Clock size={18} className="text-jungle-400" />
                </div>
                <h3 className="text-white font-semibold">Horário</h3>
              </div>
              <p className="text-gray-400 text-sm">{settings.schedule}</p>
            </div>
          )}

          {settings.email && (
            <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center">
                  <Mail size={18} className="text-jungle-400" />
                </div>
                <h3 className="text-white font-semibold">Email</h3>
              </div>
              <a href={`mailto:${settings.email}`} className="text-jungle-400 hover:text-jungle-300 text-sm transition-colors">
                {settings.email}
              </a>
            </div>
          )}

          {settings.phone && (
            <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center">
                  <Phone size={18} className="text-jungle-400" />
                </div>
                <h3 className="text-white font-semibold">Telefone</h3>
              </div>
              <a href={`tel:${settings.phone}`} className="text-jungle-400 hover:text-jungle-300 text-sm transition-colors">
                {settings.phone}
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
