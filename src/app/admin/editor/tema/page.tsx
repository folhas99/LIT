"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Palette,
  Type,
  Sparkles,
  Upload,
} from "lucide-react";

type ThemeSettings = Record<string, string>;

const defaultTheme: ThemeSettings = {
  themeColorPrimary: "#4a7c59",
  themeColorAccent: "#39FF14",
  themeColorAccentPurple: "#a855f7",
  themeColorAccentPink: "#e84393",
  themeColorAccentBlue: "#0984e3",
  themeColorAccentGold: "#d4a017",
  themeColorBackground: "#0a1f0f",
  themeColorSurface: "#0f2d16",
  themeColorText: "#ffffff",
  themeColorTextMuted: "#9ca3af",
  themeFontHeading: "Inter",
  themeFontBody: "Inter",
  themeAnimations: "true",
  themeParticles: "true",
};

const colorGroups = [
  {
    title: "Cores Principais",
    fields: [
      { key: "themeColorPrimary", label: "Cor Principal (Verde Jungle)" },
      { key: "themeColorAccent", label: "Destaque Neon (Verde)" },
    ],
  },
  {
    title: "Cores de Destaque",
    fields: [
      { key: "themeColorAccentPurple", label: "Roxo" },
      { key: "themeColorAccentPink", label: "Rosa" },
      { key: "themeColorAccentBlue", label: "Azul" },
      { key: "themeColorAccentGold", label: "Dourado" },
    ],
  },
  {
    title: "Cores de Fundo",
    fields: [
      { key: "themeColorBackground", label: "Fundo Principal" },
      { key: "themeColorSurface", label: "Fundo de Cartoes" },
    ],
  },
  {
    title: "Cores de Texto",
    fields: [
      { key: "themeColorText", label: "Texto Principal" },
      { key: "themeColorTextMuted", label: "Texto Secundario" },
    ],
  },
];

const SYSTEM_FONTS = [
  { value: "system-ui", label: "Sistema (system-ui)" },
  { value: "sans-serif", label: "Sans-serif (genérica)" },
  { value: "serif", label: "Serif (genérica)" },
  { value: "monospace", label: "Monospace (genérica)" },
];

const GOOGLE_FONTS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Raleway",
  "Oswald",
  "Playfair Display",
  "Roboto",
  "Open Sans",
  "Lato",
  "Source Sans Pro",
  "Bebas Neue",
  "Anton",
  "Archivo",
  "Space Grotesk",
  "Cormorant Garamond",
  "DM Sans",
  "DM Serif Display",
  "Manrope",
  "Outfit",
  "Work Sans",
];

type UploadedFont = {
  id: string;
  name: string;
  family: string;
  weight: number;
  style: string;
};

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function FontPicker({
  value,
  onChange,
  uploaded,
}: {
  value: string;
  onChange: (next: string) => void;
  uploaded: UploadedFont[];
}) {
  // Deduplicate uploaded font families (multiple weights can share a family).
  const uploadedFamilies = Array.from(new Set(uploaded.map((f) => f.family)));
  const isKnown =
    uploadedFamilies.includes(value) ||
    GOOGLE_FONTS.includes(value) ||
    SYSTEM_FONTS.some((f) => f.value === value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
    >
      {!isKnown && value && (
        <option value={value}>{value} (em uso)</option>
      )}
      {uploadedFamilies.length > 0 && (
        <optgroup label="Carregadas">
          {uploadedFamilies.map((family) => (
            <option key={`up-${family}`} value={family}>
              {family}
            </option>
          ))}
        </optgroup>
      )}
      <optgroup label="Google Fonts">
        {GOOGLE_FONTS.map((font) => (
          <option key={`g-${font}`} value={font}>
            {font}
          </option>
        ))}
      </optgroup>
      <optgroup label="Sistema">
        {SYSTEM_FONTS.map((font) => (
          <option key={`s-${font.value}`} value={font.value}>
            {font.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

export default function ThemeEditorPage() {
  const [theme, setTheme] = useState<ThemeSettings>({ ...defaultTheme });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFont[]>([]);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/theme")
      .then((r) => r.json())
      .then((data) => {
        setTheme({ ...defaultTheme, ...data });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Load uploaded fonts so the picker can list them in addition to Google /
  // system fonts. Failures are silent — the picker just shows the built-ins.
  useEffect(() => {
    fetch("/api/fonts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: UploadedFont[]) => setUploadedFonts(Array.isArray(data) ? data : []))
      .catch(() => setUploadedFonts([]));
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const updateField = (key: string, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao guardar tema");
      }
      const data = await res.json();
      setTheme({ ...defaultTheme, ...data });
      setToast({ type: "success", message: "Tema guardado com sucesso!" });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Erro ao guardar tema",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTheme({ ...defaultTheme });
    setToast({
      type: "success",
      message: "Tema reposto para valores predefinidos. Guarda para aplicar.",
    });
  };

  const resetField = (key: string) => {
    if (defaultTheme[key] !== undefined) {
      updateField(key, defaultTheme[key]);
    }
  };

  if (loading) return <p className="text-gray-500">A carregar...</p>;

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Editor Panel */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Editor de Tema</h1>
            <p className="text-gray-400 text-sm mt-1">
              Personaliza as cores, tipografia e efeitos visuais do site.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 hover:bg-jungle-800 text-gray-300 hover:text-white text-sm transition-colors rounded-sm"
            >
              <RotateCcw size={16} />
              Repor Predefinicoes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
            >
              <Save size={16} />
              {saving ? "A guardar..." : "Guardar Tema"}
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-sm text-sm ${
              toast.type === "success"
                ? "bg-green-900/30 border border-green-700/30 text-green-400"
                : "bg-red-900/30 border border-red-700/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {toast.message}
          </div>
        )}

        {/* Colors */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Palette size={20} className="text-jungle-400" />
            <h2 className="text-lg font-semibold text-white">Cores</h2>
          </div>

          <div className="space-y-8">
            {colorGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center gap-3 p-3 bg-jungle-900/50 border border-jungle-700/30 rounded-sm"
                    >
                      <div className="relative flex-shrink-0">
                        <input
                          type="color"
                          value={theme[field.key] || "#000000"}
                          onChange={(e) =>
                            updateField(field.key, e.target.value)
                          }
                          className="w-10 h-10 rounded-sm border border-jungle-700/50 cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs text-gray-400 mb-1">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={theme[field.key] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateField(field.key, val);
                          }}
                          maxLength={7}
                          className={`w-full px-2 py-1 bg-jungle-950 border rounded-sm text-white text-sm font-mono focus:outline-none transition-colors ${
                            isValidHex(theme[field.key])
                              ? "border-jungle-700/50 focus:border-jungle-500"
                              : "border-red-700/50 focus:border-red-500"
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => resetField(field.key)}
                        title="Repor valor predefinido"
                        className="flex-shrink-0 p-1.5 text-gray-600 hover:text-gray-300 transition-colors"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Type size={20} className="text-jungle-400" />
              <h2 className="text-lg font-semibold text-white">Tipografia</h2>
            </div>
            <Link
              href="/admin/editor/fontes"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-jungle-900 border border-jungle-700/50 hover:bg-jungle-800 text-gray-300 hover:text-white text-xs rounded-sm transition-colors"
            >
              <Upload size={14} />
              Gerir fontes
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
              <label className="block text-sm text-gray-300 mb-2">
                Fonte dos Titulos
              </label>
              <FontPicker
                value={theme.themeFontHeading || "Inter"}
                onChange={(v) => updateField("themeFontHeading", v)}
                uploaded={uploadedFonts}
              />
              <p
                className="mt-3 text-lg text-white"
                style={{ fontFamily: `"${theme.themeFontHeading}", sans-serif` }}
              >
                Exemplo de Titulo
              </p>
            </div>

            <div className="p-4 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
              <label className="block text-sm text-gray-300 mb-2">
                Fonte do Corpo
              </label>
              <FontPicker
                value={theme.themeFontBody || "Inter"}
                onChange={(v) => updateField("themeFontBody", v)}
                uploaded={uploadedFonts}
              />
              <p
                className="mt-3 text-sm text-gray-300"
                style={{ fontFamily: `"${theme.themeFontBody}", sans-serif` }}
              >
                Exemplo de texto do corpo do site com a fonte selecionada.
              </p>
            </div>
          </div>

          {uploadedFonts.length === 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Dica: podes carregar fontes próprias (.woff2, .woff, .ttf, .otf)
              em <Link href="/admin/editor/fontes" className="text-jungle-300 hover:underline">Gerir fontes</Link>.
            </p>
          )}
        </section>

        {/* Effects */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={20} className="text-jungle-400" />
            <h2 className="text-lg font-semibold text-white">Efeitos</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "themeAnimations",
                label: "Animacoes",
                description:
                  "Ativa animacoes de entrada e transicoes no site.",
              },
              {
                key: "themeParticles",
                label: "Particulas Flutuantes",
                description:
                  "Mostra particulas decorativas flutuantes no fundo.",
              },
            ].map((toggle) => (
              <label
                key={toggle.key}
                className="flex items-center justify-between p-4 bg-jungle-900/50 border border-jungle-700/30 rounded-sm cursor-pointer hover:bg-jungle-800/50 transition-colors"
              >
                <div>
                  <span className="text-white text-sm font-medium">
                    {toggle.label}
                  </span>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {toggle.description}
                  </p>
                </div>
                <div className="relative flex-shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={theme[toggle.key] !== "false"}
                    onChange={(e) =>
                      updateField(
                        toggle.key,
                        e.target.checked ? "true" : "false"
                      )
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
      </div>

      {/* Preview Panel */}
      <div className="xl:w-96 flex-shrink-0">
        <div className="xl:sticky xl:top-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Pré-visualização
          </h2>
          <div
            className="rounded-sm border border-jungle-700/30 overflow-hidden"
            style={{ backgroundColor: theme.themeColorBackground }}
          >
            {/* Preview Header */}
            <div
              className="px-4 py-3 border-b"
              style={{
                backgroundColor: theme.themeColorSurface,
                borderColor: theme.themeColorPrimary + "30",
              }}
            >
              <span
                className="text-sm font-bold tracking-wider"
                style={{
                  color: theme.themeColorAccent,
                  fontFamily: theme.themeFontHeading,
                }}
              >
                LIT
              </span>
            </div>

            {/* Preview Hero */}
            <div className="px-4 py-6 text-center">
              <h3
                className="text-lg font-bold mb-1"
                style={{
                  color: theme.themeColorText,
                  fontFamily: theme.themeFontHeading,
                }}
              >
                Titulo de Exemplo
              </h3>
              <p
                className="text-xs mb-3"
                style={{
                  color: theme.themeColorTextMuted,
                  fontFamily: theme.themeFontBody,
                }}
              >
                Subtitulo do site com texto secundario
              </p>
              <button
                className="px-4 py-1.5 text-xs font-semibold rounded-sm transition-colors"
                style={{
                  backgroundColor: theme.themeColorPrimary,
                  color: theme.themeColorText,
                }}
              >
                Botao Principal
              </button>
            </div>

            {/* Preview Cards */}
            <div className="px-4 pb-4 space-y-3">
              <div
                className="p-3 rounded-sm border"
                style={{
                  backgroundColor: theme.themeColorSurface,
                  borderColor: theme.themeColorPrimary + "20",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.themeColorAccent }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: theme.themeColorText,
                      fontFamily: theme.themeFontHeading,
                    }}
                  >
                    Evento de Exemplo
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{
                    color: theme.themeColorTextMuted,
                    fontFamily: theme.themeFontBody,
                  }}
                >
                  Descricao de um evento com detalhes.
                </p>
              </div>

              {/* Color Accent Swatches */}
              <div className="flex gap-2">
                {[
                  theme.themeColorAccent,
                  theme.themeColorAccentPurple,
                  theme.themeColorAccentPink,
                  theme.themeColorAccentBlue,
                  theme.themeColorAccentGold,
                ].map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-6 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Preview Badge */}
              <div className="flex gap-2">
                <span
                  className="px-2 py-0.5 text-xs rounded-sm"
                  style={{
                    backgroundColor: theme.themeColorAccentPurple + "20",
                    color: theme.themeColorAccentPurple,
                  }}
                >
                  VIP
                </span>
                <span
                  className="px-2 py-0.5 text-xs rounded-sm"
                  style={{
                    backgroundColor: theme.themeColorAccentPink + "20",
                    color: theme.themeColorAccentPink,
                  }}
                >
                  Novo
                </span>
                <span
                  className="px-2 py-0.5 text-xs rounded-sm"
                  style={{
                    backgroundColor: theme.themeColorAccentBlue + "20",
                    color: theme.themeColorAccentBlue,
                  }}
                >
                  Info
                </span>
                <span
                  className="px-2 py-0.5 text-xs rounded-sm"
                  style={{
                    backgroundColor: theme.themeColorAccentGold + "20",
                    color: theme.themeColorAccentGold,
                  }}
                >
                  Gold
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
