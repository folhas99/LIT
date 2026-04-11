"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle } from "lucide-react";

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
