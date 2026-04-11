"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUploader from "@/components/admin/ImageUploader";

type Settings = Record<string, string>;

const tabs = [
  { id: "homepage", label: "Homepage" },
  { id: "sobre", label: "Sobre" },
  { id: "contacto", label: "Contacto" },
  { id: "reservas", label: "Reservas" },
  { id: "rodape", label: "Rodap\u00e9" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function EditorPaginasPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("homepage");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar defini\u00e7\u00f5es.");
        setLoading(false);
      });
  }, []);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Erro ao guardar");

      const data = await res.json();
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erro ao guardar as altera\u00e7\u00f5es.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">A carregar...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Editor de P\u00e1ginas</h1>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle size={16} /> Guardado!
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            <Save size={18} />
            {saving ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-jungle-700/30 mb-8">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-3 text-sm font-medium tracking-wide transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-jungle-500 text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-jungle-700/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="max-w-3xl">
        {activeTab === "homepage" && (
          <HomepageTab settings={settings} update={update} />
        )}
        {activeTab === "sobre" && (
          <SobreTab settings={settings} update={update} />
        )}
        {activeTab === "contacto" && (
          <ContactoTab settings={settings} update={update} />
        )}
        {activeTab === "reservas" && (
          <ReservasTab settings={settings} update={update} />
        )}
        {activeTab === "rodape" && (
          <RodapeTab settings={settings} update={update} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared field components                                             */
/* ------------------------------------------------------------------ */

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors resize-none"
      />
    </div>
  );
}

function LivePreview({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 p-4 bg-jungle-900/30 border border-jungle-700/20 rounded-sm">
      <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-3">
        <Eye size={12} />
        {label}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Homepage                                                       */
/* ------------------------------------------------------------------ */

type TabProps = {
  settings: Settings;
  update: (key: string, value: string) => void;
};

function HomepageTab({ settings, update }: TabProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Hero</h2>
        <div className="space-y-4">
          <TextField
            label="T\u00edtulo do Hero"
            value={settings.contentHeroTitle || ""}
            onChange={(v) => update("contentHeroTitle", v)}
            placeholder="LIT Coimbra"
          />
          <TextField
            label="Subt\u00edtulo do Hero"
            value={settings.contentHeroSubtitle || ""}
            onChange={(v) => update("contentHeroSubtitle", v)}
            placeholder="A tua nova casa"
          />
          <TextField
            label="Texto do Bot\u00e3o 1 (CTA)"
            value={settings.contentHeroCTA1Text || ""}
            onChange={(v) => update("contentHeroCTA1Text", v)}
            placeholder="Reservar Mesa"
          />
          <TextField
            label="Texto do Bot\u00e3o 2 (CTA)"
            value={settings.contentHeroCTA2Text || ""}
            onChange={(v) => update("contentHeroCTA2Text", v)}
            placeholder="Ver Eventos"
          />
          <ImageUploader
            label="Imagem do Hero"
            value={settings.heroImage || ""}
            onChange={(v) => update("heroImage", v)}
          />
          <TextField
            label="URL do V\u00eddeo Hero"
            value={settings.heroVideo || ""}
            onChange={(v) => update("heroVideo", v)}
            placeholder="https://..."
          />
        </div>

        <LivePreview label="Pr\u00e9-visualiza\u00e7\u00e3o do Hero">
          <div className="text-center py-6">
            <h3 className="text-2xl font-bold text-white tracking-wider">
              {settings.contentHeroTitle || "LIT Coimbra"}
            </h3>
            <p className="mt-2 text-sm text-gray-400 tracking-widest uppercase">
              {settings.contentHeroSubtitle || "A tua nova casa"}
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <span className="px-4 py-1.5 bg-jungle-600 text-white text-xs rounded-sm">
                {settings.contentHeroCTA1Text || "Reservar Mesa"}
              </span>
              <span className="px-4 py-1.5 border border-white/20 text-white text-xs rounded-sm">
                {settings.contentHeroCTA2Text || "Ver Eventos"}
              </span>
            </div>
          </div>
        </LivePreview>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          T\u00edtulos das Sec\u00e7\u00f5es
        </h2>
        <div className="space-y-4">
          <TextField
            label="T\u00edtulo Sec\u00e7\u00e3o Eventos"
            value={settings.contentEventsTitle || ""}
            onChange={(v) => update("contentEventsTitle", v)}
            placeholder="Eventos"
          />
          <TextField
            label="T\u00edtulo Sec\u00e7\u00e3o Galeria"
            value={settings.contentGaleriaTitle || ""}
            onChange={(v) => update("contentGaleriaTitle", v)}
            placeholder="Galeria"
          />
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Sobre                                                          */
/* ------------------------------------------------------------------ */

function SobreTab({ settings, update }: TabProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          P\u00e1gina Sobre
        </h2>
        <div className="space-y-4">
          <TextField
            label="T\u00edtulo da P\u00e1gina"
            value={settings.contentAboutTitle || ""}
            onChange={(v) => update("contentAboutTitle", v)}
            placeholder="Sobre"
          />
          <TextAreaField
            label="Par\u00e1grafo 1"
            value={settings.contentAboutText1 || ""}
            onChange={(v) => update("contentAboutText1", v)}
            rows={5}
            placeholder="Texto principal sobre o espa\u00e7o..."
          />
          <TextAreaField
            label="Par\u00e1grafo 2"
            value={settings.contentAboutText2 || ""}
            onChange={(v) => update("contentAboutText2", v)}
            rows={5}
            placeholder="Mais detalhes sobre o espa\u00e7o..."
          />
        </div>

        <LivePreview label="Pr\u00e9-visualiza\u00e7\u00e3o da p\u00e1gina Sobre">
          <div className="py-4">
            <h3 className="text-xl font-bold text-white tracking-wide mb-4">
              {settings.contentAboutTitle || "Sobre"}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              {settings.contentAboutText1 || ""}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              {settings.contentAboutText2 || ""}
            </p>
          </div>
        </LivePreview>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Contacto                                                       */
/* ------------------------------------------------------------------ */

function ContactoTab({ settings, update }: TabProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          P\u00e1gina Contacto
        </h2>
        <div className="space-y-4">
          <TextField
            label="T\u00edtulo da Sec\u00e7\u00e3o"
            value={settings.contentContactTitle || ""}
            onChange={(v) => update("contentContactTitle", v)}
            placeholder="Fala connosco"
          />
          <TextAreaField
            label="Descri\u00e7\u00e3o"
            value={settings.contentContactText || ""}
            onChange={(v) => update("contentContactText", v)}
            rows={3}
            placeholder="Tens alguma quest\u00e3o ou sugest\u00e3o?..."
          />
        </div>

        <LivePreview label="Pr\u00e9-visualiza\u00e7\u00e3o do Contacto">
          <div className="py-4">
            <h3 className="text-xl font-bold text-white mb-2">
              {settings.contentContactTitle || "Fala connosco"}
            </h3>
            <p className="text-sm text-gray-400">
              {settings.contentContactText || ""}
            </p>
          </div>
        </LivePreview>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Reservas                                                       */
/* ------------------------------------------------------------------ */

function ReservasTab({ settings, update }: TabProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          P\u00e1gina Reservas
        </h2>
        <div className="space-y-4">
          <TextField
            label="T\u00edtulo da P\u00e1gina"
            value={settings.contentReservasTitle || ""}
            onChange={(v) => update("contentReservasTitle", v)}
            placeholder="Reserva VIP"
          />
          <TextAreaField
            label="Descri\u00e7\u00e3o"
            value={settings.contentReservasText || ""}
            onChange={(v) => update("contentReservasText", v)}
            rows={3}
            placeholder="Garante a tua mesa..."
          />
        </div>

        <LivePreview label="Pr\u00e9-visualiza\u00e7\u00e3o das Reservas">
          <div className="py-4">
            <h3 className="text-xl font-bold text-white mb-2">
              {settings.contentReservasTitle || "Reserva VIP"}
            </h3>
            <p className="text-sm text-gray-400">
              {settings.contentReservasText || ""}
            </p>
          </div>
        </LivePreview>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Rodap\u00e9                                                         */
/* ------------------------------------------------------------------ */

function RodapeTab({ settings, update }: TabProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Rodap\u00e9 (Footer)
        </h2>
        <div className="space-y-4">
          <TextField
            label="Texto do Rodap\u00e9"
            value={settings.contentFooterText || ""}
            onChange={(v) => update("contentFooterText", v)}
            placeholder="A tua nova casa em Coimbra."
          />
        </div>

        <LivePreview label="Pr\u00e9-visualiza\u00e7\u00e3o do Rodap\u00e9">
          <div className="py-4 text-center">
            <p className="text-sm text-gray-400">
              {settings.contentFooterText || "A tua nova casa em Coimbra."}
            </p>
          </div>
        </LivePreview>
      </section>
    </div>
  );
}
