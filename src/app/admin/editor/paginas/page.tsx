"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUploader from "@/components/admin/ImageUploader";
import BilingualInput from "@/components/admin/BilingualInput";

type Settings = Record<string, string>;

type PageMetaRow = {
  title: string;
  description: string;
  ogImage: string;
  noIndex: boolean;
};
type PageMetaMap = Record<string, PageMetaRow>;

const SEO_PAGES = [
  { id: "homepage", label: "Homepage" },
  { id: "eventos", label: "Eventos" },
  { id: "galeria", label: "Galeria" },
  { id: "sobre", label: "Sobre" },
  { id: "contacto", label: "Contacto" },
  { id: "reservas", label: "Reservas" },
] as const;

function emptyMeta(): PageMetaRow {
  return { title: "", description: "", ogImage: "", noIndex: false };
}

const tabs = [
  { id: "homepage", label: "Homepage" },
  { id: "sobre", label: "Sobre" },
  { id: "contacto", label: "Contacto" },
  { id: "reservas", label: "Reservas" },
  { id: "rodape", label: "Rodapé" },
  { id: "seo", label: "SEO" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function EditorPaginasPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [pageMeta, setPageMeta] = useState<PageMetaMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("homepage");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/page-meta").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([settingsData, metaData]) => {
        setSettings(settingsData);
        setPageMeta(metaData || {});
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar definições.");
        setLoading(false);
      });
  }, []);

  const updateMeta = (page: string, key: keyof PageMetaRow, value: string | boolean) => {
    setPageMeta((prev) => ({
      ...prev,
      [page]: { ...(prev[page] || emptyMeta()), [key]: value },
    }));
  };

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const [settingsRes, metaRes] = await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        }),
        fetch("/api/page-meta", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageMeta),
        }),
      ]);

      if (!settingsRes.ok || !metaRes.ok) throw new Error("Erro ao guardar");

      const data = await settingsRes.json();
      const meta = await metaRes.json();
      setSettings(data);
      setPageMeta(meta || {});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erro ao guardar as alterações.");
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
        <h1 className="text-2xl font-bold text-white">Editor de Páginas</h1>
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
        {activeTab === "seo" && (
          <SeoTab pageMeta={pageMeta} updateMeta={updateMeta} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: SEO                                                            */
/* ------------------------------------------------------------------ */

function SeoTab({
  pageMeta,
  updateMeta,
}: {
  pageMeta: PageMetaMap;
  updateMeta: (page: string, key: keyof PageMetaRow, value: string | boolean) => void;
}) {
  const [selected, setSelected] = useState<string>(SEO_PAGES[0].id);
  const data = pageMeta[selected] || emptyMeta();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">SEO por Página</h2>
        <p className="text-sm text-gray-500 mb-4">
          Personaliza o título, descrição e imagem de partilha (Open Graph) de cada página.
          Estes campos são os que aparecem no Google e nas redes sociais.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEO_PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={cn(
              "px-4 py-2 text-sm rounded-sm border transition-colors",
              selected === p.id
                ? "bg-jungle-600 border-jungle-500 text-white"
                : "bg-jungle-900 border-jungle-700/50 text-gray-400 hover:text-white hover:border-jungle-600"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 bg-jungle-900/30 border border-jungle-700/20 p-5 rounded-sm">
        <TextField
          label="Meta Title"
          value={data.title}
          onChange={(v) => updateMeta(selected, "title", v)}
          placeholder="Deixa vazio para usar o padrão"
        />
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">
            Meta Description
            <span className="text-gray-500 ml-2 text-xs">
              ({data.description.length}/160 caracteres)
            </span>
          </label>
          <textarea
            value={data.description}
            onChange={(e) => updateMeta(selected, "description", e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Descrição que aparece no Google e redes sociais"
            className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors resize-none"
          />
        </div>
        <TextField
          label="Imagem Open Graph (URL)"
          value={data.ogImage}
          onChange={(v) => updateMeta(selected, "ogImage", v)}
          placeholder="https://litcoimbra.pt/uploads/og-image.jpg"
        />
        <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
          <input
            type="checkbox"
            checked={data.noIndex}
            onChange={(e) => updateMeta(selected, "noIndex", e.target.checked)}
            className="w-4 h-4 accent-jungle-500"
          />
          Não indexar esta página (noindex)
        </label>
      </div>

      {data.ogImage && (
        <LivePreview label="Pré-visualização Open Graph">
          <div className="max-w-md border border-jungle-700/40 rounded-sm overflow-hidden bg-jungle-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.ogImage}
              alt=""
              className="w-full aspect-[1.91/1] object-cover"
            />
            <div className="p-3">
              <p className="text-xs text-gray-500 uppercase">litcoimbra.pt</p>
              <p className="text-sm text-white font-semibold truncate">
                {data.title || "Título da página"}
              </p>
              <p className="text-xs text-gray-400 line-clamp-2">
                {data.description || "Descrição da página"}
              </p>
            </div>
          </div>
        </LivePreview>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared field components                                             */
/* ------------------------------------------------------------------ */

/**
 * Bilingual setting field. Reads PT from `settings[key]` and EN from
 * `settings[`${key}__en`]`. If EN is disabled in settings, only PT is shown.
 */
function BiField({
  label,
  settingKey,
  settings,
  update,
  placeholder,
  multiline,
  rows,
}: {
  label: string;
  settingKey: string;
  settings: Settings;
  update: (key: string, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const englishEnabled = settings.localeEnabledEn !== "false";
  const common = {
    label,
    valuePt: settings[settingKey] || "",
    valueEn: settings[`${settingKey}__en`] || "",
    onChangePt: (v: string) => update(settingKey, v),
    onChangeEn: (v: string) => update(`${settingKey}__en`, v),
    englishEnabled,
    placeholder,
  };
  return multiline ? (
    <BilingualInput as="textarea" rows={rows ?? 4} {...common} />
  ) : (
    <BilingualInput {...common} />
  );
}

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
          <BiField
            label="Título do Hero"
            settingKey="contentHeroTitle"
            settings={settings}
            update={update}
            placeholder="LIT Coimbra"
          />
          <BiField
            label="Subtítulo do Hero"
            settingKey="contentHeroSubtitle"
            settings={settings}
            update={update}
            placeholder="A tua nova casa"
          />
          <BiField
            label="Texto do Botão 1 (CTA)"
            settingKey="contentHeroCTA1Text"
            settings={settings}
            update={update}
            placeholder="Reservar Mesa"
          />
          <BiField
            label="Texto do Botão 2 (CTA)"
            settingKey="contentHeroCTA2Text"
            settings={settings}
            update={update}
            placeholder="Ver Eventos"
          />
          <ImageUploader
            label="Imagem do Hero"
            value={settings.heroImage || ""}
            onChange={(v) => update("heroImage", v)}
          />
          <TextField
            label="URL do Vídeo Hero"
            value={settings.heroVideo || ""}
            onChange={(v) => update("heroVideo", v)}
            placeholder="https://..."
          />
        </div>

        <LivePreview label="Pré-visualização do Hero">
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
          Títulos das Secções
        </h2>
        <div className="space-y-4">
          <BiField
            label="Título Secção Eventos"
            settingKey="contentEventsTitle"
            settings={settings}
            update={update}
            placeholder="Eventos"
          />
          <BiField
            label="Título Secção Galeria"
            settingKey="contentGaleriaTitle"
            settings={settings}
            update={update}
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
          Página Sobre
        </h2>
        <div className="space-y-4">
          <BiField
            label="Título da Página"
            settingKey="contentAboutTitle"
            settings={settings}
            update={update}
            placeholder="Sobre"
          />
          <BiField
            label="Parágrafo 1"
            settingKey="contentAboutText1"
            settings={settings}
            update={update}
            multiline
            rows={5}
            placeholder="Texto principal sobre o espaço..."
          />
          <BiField
            label="Parágrafo 2"
            settingKey="contentAboutText2"
            settings={settings}
            update={update}
            multiline
            rows={5}
            placeholder="Mais detalhes sobre o espaço..."
          />
        </div>

        <LivePreview label="Pré-visualização da página Sobre">
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
          Página Contacto
        </h2>
        <div className="space-y-4">
          <BiField
            label="Título da Secção"
            settingKey="contentContactTitle"
            settings={settings}
            update={update}
            placeholder="Fala connosco"
          />
          <BiField
            label="Descrição"
            settingKey="contentContactText"
            settings={settings}
            update={update}
            multiline
            rows={3}
            placeholder="Tens alguma questão ou sugestão?..."
          />
        </div>

        <LivePreview label="Pré-visualização do Contacto">
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
          Página Reservas
        </h2>
        <div className="space-y-4">
          <BiField
            label="Título da Página"
            settingKey="contentReservasTitle"
            settings={settings}
            update={update}
            placeholder="Reserva VIP"
          />
          <BiField
            label="Descrição"
            settingKey="contentReservasText"
            settings={settings}
            update={update}
            multiline
            rows={3}
            placeholder="Garante a tua mesa..."
          />
        </div>

        <LivePreview label="Pré-visualização das Reservas">
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
/* Tab: Rodapé                                                         */
/* ------------------------------------------------------------------ */

function RodapeTab({ settings, update }: TabProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Rodapé (Footer)
        </h2>
        <div className="space-y-4">
          <BiField
            label="Texto do Rodapé"
            settingKey="contentFooterText"
            settings={settings}
            update={update}
            placeholder="A tua nova casa em Coimbra."
          />
        </div>

        <LivePreview label="Pré-visualização do Rodapé">
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
