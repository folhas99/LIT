"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle } from "lucide-react";
import { DAY_KEYS, DAY_LABELS, parseSchedule, type DayKey, type ScheduleMap } from "@/lib/schedule";

type Settings = Record<string, string>;

const settingsFields = [
  { key: "siteName", label: "Nome do Site", type: "text" },
  { key: "siteDescription", label: "Descrição do Site", type: "text" },
  { key: "heroTitle", label: "Título do Hero", type: "text" },
  { key: "heroSubtitle", label: "Subtítulo do Hero", type: "text" },
  { key: "heroVideo", label: "URL do Vídeo Hero", type: "text" },
  { key: "heroImage", label: "URL da Imagem Hero", type: "text" },
  { key: "address", label: "Morada", type: "text" },
  { key: "phone", label: "Telefone", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "schedule", label: "Horário", type: "text" },
  { key: "instagram", label: "Instagram URL", type: "text" },
  { key: "facebook", label: "Facebook URL", type: "text" },
  { key: "tiktok", label: "TikTok URL", type: "text" },
];

const sectionToggles = [
  { key: "sectionEvents", label: "Secção Eventos" },
  { key: "sectionGallery", label: "Secção Galeria" },
  { key: "sectionReservations", label: "Secção Reservas VIP" },
  { key: "sectionAbout", label: "Secção Sobre" },
  { key: "sectionContact", label: "Secção Contacto" },
];

export default function AdminDefinicoesPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <p className="text-gray-500">A carregar...</p>;

  const schedule: ScheduleMap = parseSchedule(settings.scheduleHours || "{}");
  const updateScheduleDay = (day: DayKey, range: [string, string] | null) => {
    const next = { ...schedule, [day]: range };
    setSettings({ ...settings, scheduleHours: JSON.stringify(next) });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Definições</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* General settings */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Geral</h2>
          <div className="space-y-4">
            {settingsFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-gray-300 mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={settings[field.key] || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, [field.key]: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Analytics */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Analytics</h2>
          <p className="text-gray-500 text-sm mb-4">
            Integra Plausible Analytics — privacy-friendly, sem cookies. Cria a conta em{" "}
            <a href="https://plausible.io" target="_blank" rel="noopener noreferrer" className="text-neon-green underline">plausible.io</a>{" "}
            e introduz o teu domínio abaixo. Deixa vazio para desativar.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Domínio Plausible</label>
              <input
                type="text"
                value={settings.analyticsPlausibleDomain || ""}
                onChange={(e) => setSettings({ ...settings, analyticsPlausibleDomain: e.target.value })}
                placeholder="litcoimbra.pt"
                className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">URL do Script (avançado)</label>
              <input
                type="text"
                value={settings.analyticsPlausibleScript || ""}
                onChange={(e) => setSettings({ ...settings, analyticsPlausibleScript: e.target.value })}
                placeholder="https://plausible.io/js/script.js"
                className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Muda apenas se usas Plausible self-hosted ou variações (ex.: script.outbound-links.js).
              </p>
            </div>
          </div>
        </section>

        {/* Map */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Mapa</h2>
          <p className="text-gray-500 text-sm mb-4">
            Coordenadas GPS mostradas na página de contacto. Podes obtê-las clicando com o botão direito em{" "}
            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-neon-green underline">Google Maps</a>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Latitude</label>
              <input
                type="text"
                inputMode="decimal"
                value={settings.mapLatitude || ""}
                onChange={(e) => setSettings({ ...settings, mapLatitude: e.target.value })}
                placeholder="40.2111"
                className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Longitude</label>
              <input
                type="text"
                inputMode="decimal"
                value={settings.mapLongitude || ""}
                onChange={(e) => setSettings({ ...settings, mapLongitude: e.target.value })}
                placeholder="-8.4292"
                className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500"
              />
            </div>
          </div>
        </section>

        {/* Opening Hours */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Horários (Aberto agora)</h2>
          <p className="text-gray-500 text-sm mb-4">
            Define o horário por dia. Se o fecho for antes da abertura (ex.: 06:00 &lt; 23:00), o intervalo é tratado como atravessando a meia-noite.
          </p>
          <div className="space-y-2">
            {DAY_KEYS.map((day) => {
              const range = schedule[day];
              const enabled = !!range;
              return (
                <div
                  key={day}
                  className="flex items-center gap-3 p-3 bg-jungle-900/50 border border-jungle-700/30 rounded-sm"
                >
                  <label className="flex items-center gap-2 w-28 text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) =>
                        updateScheduleDay(day, e.target.checked ? ["23:00", "06:00"] : null)
                      }
                      className="accent-jungle-500"
                    />
                    {DAY_LABELS[day]}
                  </label>
                  <input
                    type="time"
                    disabled={!enabled}
                    value={range?.[0] ?? ""}
                    onChange={(e) =>
                      updateScheduleDay(day, [e.target.value, range?.[1] ?? "06:00"])
                    }
                    className="px-3 py-2 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm disabled:opacity-40 focus:outline-none focus:border-jungle-500"
                  />
                  <span className="text-gray-500 text-sm">até</span>
                  <input
                    type="time"
                    disabled={!enabled}
                    value={range?.[1] ?? ""}
                    onChange={(e) =>
                      updateScheduleDay(day, [range?.[0] ?? "23:00", e.target.value])
                    }
                    className="px-3 py-2 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm disabled:opacity-40 focus:outline-none focus:border-jungle-500"
                  />
                  {!enabled && <span className="text-gray-500 text-xs ml-auto">Fechado</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section toggles */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            Secções do Site
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Ativa ou desativa secções no frontend. As secções desativadas não aparecerão no menu nem na homepage.
          </p>
          <div className="space-y-3">
            {sectionToggles.map((toggle) => (
              <label
                key={toggle.key}
                className="flex items-center justify-between p-3 bg-jungle-900/50 border border-jungle-700/30 rounded-sm cursor-pointer hover:bg-jungle-800/50 transition-colors"
              >
                <span className="text-gray-300 text-sm">{toggle.label}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings[toggle.key] !== "false"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [toggle.key]: e.target.checked ? "true" : "false",
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-jungle-700 rounded-full peer-checked:bg-jungle-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            <Save size={18} />
            {saving ? "A guardar..." : "Guardar Definições"}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle size={16} /> Guardado com sucesso!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
