"use client";

import { useEffect, useState } from "react";
import {
  Save,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  MousePointerClick,
  CreditCard,
  FormInput,
} from "lucide-react";

type Elements = Record<string, string>;

const defaults: Elements = {
  // Buttons
  themeButtonRadius: "2",
  themeButtonPaddingX: "32",
  themeButtonPaddingY: "12",
  themeButtonFontWeight: "600",
  themeButtonTextTransform: "uppercase",
  themeButtonLetterSpacing: "0.1",
  themeButtonPrimaryBg: "#2d5a27",
  themeButtonPrimaryText: "#ffffff",
  themeButtonPrimaryHoverBg: "#4a8c3f",
  themeButtonSecondaryBg: "transparent",
  themeButtonSecondaryText: "#ffffff",
  themeButtonSecondaryBorder: "#ffffff33",
  themeButtonSecondaryHoverBg: "#ffffff10",
  themeButtonGhostText: "#39FF14",
  themeButtonGhostHoverBg: "#39FF1420",
  // Cards
  themeCardRadius: "2",
  themeCardBg: "#0f2d16",
  themeCardBorderColor: "#1a2a1a",
  themeCardBorderWidth: "1",
  themeCardShadow: "soft",
  // Inputs
  themeInputRadius: "2",
  themeInputBg: "#0a1f0f",
  themeInputBorderColor: "#1a2a1a",
  themeInputText: "#ffffff",
  themeInputFocusColor: "#4a8c3f",
};

function isHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value);
}
function isHexOrTransparent(value: string): boolean {
  return value === "transparent" || isHex(value);
}

export default function ElementsEditorPage() {
  const [el, setEl] = useState<Elements>({ ...defaults });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/theme")
      .then((r) => r.json())
      .then((data: Elements) => {
        setEl({ ...defaults, ...data });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const update = (k: string, v: string) => setEl((p) => ({ ...p, [k]: v }));
  const reset = (k: string) => {
    if (defaults[k] !== undefined) update(k, defaults[k]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only send the keys this editor manages.
      const payload: Elements = {};
      for (const k of Object.keys(defaults)) payload[k] = el[k] ?? defaults[k];
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao guardar");
      }
      setToast({ type: "success", message: "Elementos guardados!" });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setEl({ ...defaults });
    setToast({ type: "success", message: "Predefinições restauradas. Guarda para aplicar." });
  };

  // Inline preview style (mirrors public CSS without persisting to DOM)
  const previewVars: React.CSSProperties & Record<string, string> = {
    "--btn-radius": `${el.themeButtonRadius}px`,
    "--btn-padding-x": `${el.themeButtonPaddingX}px`,
    "--btn-padding-y": `${el.themeButtonPaddingY}px`,
    "--btn-font-weight": el.themeButtonFontWeight,
    "--btn-text-transform": el.themeButtonTextTransform,
    "--btn-letter-spacing": `${el.themeButtonLetterSpacing}em`,
    "--btn-primary-bg": el.themeButtonPrimaryBg,
    "--btn-primary-text": el.themeButtonPrimaryText,
    "--btn-primary-hover-bg": el.themeButtonPrimaryHoverBg,
    "--btn-secondary-bg": el.themeButtonSecondaryBg,
    "--btn-secondary-text": el.themeButtonSecondaryText,
    "--btn-secondary-border": el.themeButtonSecondaryBorder,
    "--btn-secondary-hover-bg": el.themeButtonSecondaryHoverBg,
    "--btn-ghost-text": el.themeButtonGhostText,
    "--btn-ghost-hover-bg": el.themeButtonGhostHoverBg,
    "--card-radius": `${el.themeCardRadius}px`,
    "--card-bg": el.themeCardBg,
    "--card-border": el.themeCardBorderColor,
    "--card-border-width": `${el.themeCardBorderWidth}px`,
    "--card-shadow":
      el.themeCardShadow === "none"
        ? "none"
        : el.themeCardShadow === "medium"
        ? "0 4px 16px rgba(0, 0, 0, 0.35)"
        : el.themeCardShadow === "glow"
        ? "0 0 25px rgba(57, 255, 20, 0.08), 0 4px 30px rgba(0, 0, 0, 0.3)"
        : "0 2px 8px rgba(0, 0, 0, 0.25)",
    "--input-radius": `${el.themeInputRadius}px`,
    "--input-bg": el.themeInputBg,
    "--input-border": el.themeInputBorderColor,
    "--input-text": el.themeInputText,
    "--input-focus": el.themeInputFocusColor,
  };

  if (loading) return <p className="text-gray-500">A carregar...</p>;

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Elementos Visuais</h1>
            <p className="text-gray-400 text-sm mt-1">
              Personaliza a aparência global de botões, cartões e formulários do site.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 hover:bg-jungle-800 text-gray-300 hover:text-white text-sm transition-colors rounded-sm"
            >
              <RotateCcw size={16} />
              Repor Predefinições
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
            >
              <Save size={16} />
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </div>

        {toast && (
          <div
            className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-sm text-sm ${
              toast.type === "success"
                ? "bg-green-900/30 border border-green-700/30 text-green-400"
                : "bg-red-900/30 border border-red-700/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}

        {/* Buttons */}
        <Section title="Botões" icon={MousePointerClick}>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Forma Geral
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <NumberField label="Raio (px)" value={el.themeButtonRadius} onChange={(v) => update("themeButtonRadius", v)} onReset={() => reset("themeButtonRadius")} min={0} max={48} />
            <NumberField label="Padding horizontal (px)" value={el.themeButtonPaddingX} onChange={(v) => update("themeButtonPaddingX", v)} onReset={() => reset("themeButtonPaddingX")} min={4} max={64} />
            <NumberField label="Padding vertical (px)" value={el.themeButtonPaddingY} onChange={(v) => update("themeButtonPaddingY", v)} onReset={() => reset("themeButtonPaddingY")} min={4} max={32} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <SelectField
              label="Peso da fonte"
              value={el.themeButtonFontWeight}
              onChange={(v) => update("themeButtonFontWeight", v)}
              options={[
                { value: "400", label: "Regular (400)" },
                { value: "500", label: "Médio (500)" },
                { value: "600", label: "Semibold (600)" },
                { value: "700", label: "Bold (700)" },
              ]}
            />
            <SelectField
              label="Maiúsculas"
              value={el.themeButtonTextTransform}
              onChange={(v) => update("themeButtonTextTransform", v)}
              options={[
                { value: "uppercase", label: "MAIÚSCULAS" },
                { value: "none", label: "Normal" },
              ]}
            />
            <NumberField
              label="Espaçamento (em)"
              value={el.themeButtonLetterSpacing}
              onChange={(v) => update("themeButtonLetterSpacing", v)}
              onReset={() => reset("themeButtonLetterSpacing")}
              step={0.01}
              min={-0.05}
              max={0.5}
            />
          </div>

          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Variante Primária
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <ColorField label="Fundo" value={el.themeButtonPrimaryBg} onChange={(v) => update("themeButtonPrimaryBg", v)} onReset={() => reset("themeButtonPrimaryBg")} />
            <ColorField label="Texto" value={el.themeButtonPrimaryText} onChange={(v) => update("themeButtonPrimaryText", v)} onReset={() => reset("themeButtonPrimaryText")} />
            <ColorField label="Fundo no hover" value={el.themeButtonPrimaryHoverBg} onChange={(v) => update("themeButtonPrimaryHoverBg", v)} onReset={() => reset("themeButtonPrimaryHoverBg")} />
          </div>

          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Variante Secundária (outline)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <ColorField label="Fundo" value={el.themeButtonSecondaryBg} onChange={(v) => update("themeButtonSecondaryBg", v)} onReset={() => reset("themeButtonSecondaryBg")} allowTransparent />
            <ColorField label="Texto" value={el.themeButtonSecondaryText} onChange={(v) => update("themeButtonSecondaryText", v)} onReset={() => reset("themeButtonSecondaryText")} />
            <ColorField label="Borda" value={el.themeButtonSecondaryBorder} onChange={(v) => update("themeButtonSecondaryBorder", v)} onReset={() => reset("themeButtonSecondaryBorder")} />
            <ColorField label="Fundo no hover" value={el.themeButtonSecondaryHoverBg} onChange={(v) => update("themeButtonSecondaryHoverBg", v)} onReset={() => reset("themeButtonSecondaryHoverBg")} />
          </div>

          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Variante Ghost (sem fundo)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorField label="Texto" value={el.themeButtonGhostText} onChange={(v) => update("themeButtonGhostText", v)} onReset={() => reset("themeButtonGhostText")} />
            <ColorField label="Fundo no hover" value={el.themeButtonGhostHoverBg} onChange={(v) => update("themeButtonGhostHoverBg", v)} onReset={() => reset("themeButtonGhostHoverBg")} />
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cartões" icon={CreditCard}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <NumberField label="Raio (px)" value={el.themeCardRadius} onChange={(v) => update("themeCardRadius", v)} onReset={() => reset("themeCardRadius")} min={0} max={48} />
            <NumberField label="Espessura da borda (px)" value={el.themeCardBorderWidth} onChange={(v) => update("themeCardBorderWidth", v)} onReset={() => reset("themeCardBorderWidth")} min={0} max={6} />
            <SelectField
              label="Sombra"
              value={el.themeCardShadow}
              onChange={(v) => update("themeCardShadow", v)}
              options={[
                { value: "none", label: "Nenhuma" },
                { value: "soft", label: "Suave" },
                { value: "medium", label: "Média" },
                { value: "glow", label: "Glow neon" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorField label="Fundo" value={el.themeCardBg} onChange={(v) => update("themeCardBg", v)} onReset={() => reset("themeCardBg")} />
            <ColorField label="Borda" value={el.themeCardBorderColor} onChange={(v) => update("themeCardBorderColor", v)} onReset={() => reset("themeCardBorderColor")} />
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Campos de Formulário" icon={FormInput}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <NumberField label="Raio (px)" value={el.themeInputRadius} onChange={(v) => update("themeInputRadius", v)} onReset={() => reset("themeInputRadius")} min={0} max={48} />
            <ColorField label="Cor de focus" value={el.themeInputFocusColor} onChange={(v) => update("themeInputFocusColor", v)} onReset={() => reset("themeInputFocusColor")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ColorField label="Fundo" value={el.themeInputBg} onChange={(v) => update("themeInputBg", v)} onReset={() => reset("themeInputBg")} />
            <ColorField label="Borda" value={el.themeInputBorderColor} onChange={(v) => update("themeInputBorderColor", v)} onReset={() => reset("themeInputBorderColor")} />
            <ColorField label="Texto" value={el.themeInputText} onChange={(v) => update("themeInputText", v)} onReset={() => reset("themeInputText")} />
          </div>
        </Section>
      </div>

      {/* Live Preview */}
      <div className="xl:w-96 flex-shrink-0">
        <div className="xl:sticky xl:top-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Pré-visualização
          </h2>
          <div
            className="space-y-6 p-6 rounded-sm border border-jungle-700/30 bg-jungle-950"
            style={previewVars}
          >
            {/* Buttons preview */}
            <div className="space-y-3">
              <PreviewLabel>Botões</PreviewLabel>
              <button className="lit-btn lit-btn--primary w-full">Primário</button>
              <button className="lit-btn lit-btn--secondary w-full">Secundário</button>
              <button className="lit-btn lit-btn--ghost w-full">Ghost</button>
            </div>

            {/* Card preview */}
            <div className="space-y-3">
              <PreviewLabel>Cartão</PreviewLabel>
              <div className="lit-card p-4">
                <h4 className="text-white font-semibold mb-1">Título do cartão</h4>
                <p className="text-sm text-gray-400">
                  Texto descritivo dentro de um cartão típico.
                </p>
              </div>
            </div>

            {/* Input preview */}
            <div className="space-y-3">
              <PreviewLabel>Input</PreviewLabel>
              <input className="lit-input" placeholder="Escreve algo..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----- Reusable field components ----- */

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof MousePointerClick;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <Icon size={20} className="text-jungle-400" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PreviewLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-widest text-jungle-400">{children}</p>;
}

function ColorField({
  label,
  value,
  onChange,
  onReset,
  allowTransparent = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onReset: () => void;
  allowTransparent?: boolean;
}) {
  const isTransparent = value === "transparent";
  const colorValue = isTransparent ? "#000000" : value.length === 9 ? value.slice(0, 7) : value;
  const valid = allowTransparent ? isHexOrTransparent(value) : isHex(value);

  return (
    <div className="flex items-center gap-3 p-3 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
      <input
        type="color"
        value={colorValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded-sm border border-jungle-700/50 cursor-pointer bg-transparent shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
      />
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={allowTransparent ? 11 : 9}
          className={`w-full px-2 py-1 bg-jungle-950 border rounded-sm text-white text-xs font-mono focus:outline-none transition-colors ${
            valid ? "border-jungle-700/50 focus:border-jungle-500" : "border-red-700/50 focus:border-red-500"
          }`}
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        title="Repor"
        className="shrink-0 p-1.5 text-gray-600 hover:text-gray-300 transition-colors"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  onReset,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onReset: () => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        title="Repor"
        className="shrink-0 p-1.5 text-gray-600 hover:text-gray-300 transition-colors"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="p-3 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
