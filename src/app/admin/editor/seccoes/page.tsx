"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  GripVertical,
  ChevronRight,
  X,
  Layout,
  Type,
  Image,
  MousePointerClick,
  Minus,
  Space,
  Code,
  Columns3,
  MessageSquareQuote,
  Timer,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ================================================================== */
/* Types                                                               */
/* ================================================================== */

type SectionType =
  | "hero"
  | "text"
  | "image_gallery"
  | "cta"
  | "divider"
  | "spacer"
  | "embed"
  | "columns"
  | "testimonials"
  | "countdown";

interface SpacingData {
  marginTop: number;
  marginBottom: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  maxWidth: "full" | "7xl" | "6xl" | "5xl" | "4xl";
  bgColor: string;
  bgGradient: string;
  bgImage: string;
  borderRadius: number;
}

interface SectionItem {
  id: string;
  page: string;
  type: SectionType;
  content: Record<string, unknown>;
  order: number;
  visible: boolean;
  spacing: SpacingData;
  createdAt?: string;
  updatedAt?: string;
  _expanded?: boolean;
  _spacingOpen?: boolean;
}

const defaultSpacing: SpacingData = {
  marginTop: 0,
  marginBottom: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  maxWidth: "full",
  bgColor: "",
  bgGradient: "",
  bgImage: "",
  borderRadius: 0,
};

const tabs = [
  { id: "homepage", label: "Homepage" },
  { id: "sobre", label: "Sobre" },
  { id: "contacto", label: "Contacto" },
  { id: "reservas", label: "Reservas" },
  { id: "eventos", label: "Eventos" },
  { id: "galeria", label: "Galeria" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const sectionTypeMeta: Record<
  SectionType,
  { label: string; icon: typeof Layout; description: string }
> = {
  hero: {
    label: "Hero",
    icon: Layout,
    description: "Banner principal com título, subtítulo e CTA",
  },
  text: {
    label: "Texto",
    icon: Type,
    description: "Bloco de texto com título opcional",
  },
  image_gallery: {
    label: "Galeria de Imagens",
    icon: Image,
    description: "Grelha de imagens com colunas configuráveis",
  },
  cta: {
    label: "Call to Action",
    icon: MousePointerClick,
    description: "Botão de ação com título e descrição",
  },
  divider: {
    label: "Divisor",
    icon: Minus,
    description: "Linha divisora entre secções",
  },
  spacer: {
    label: "Espaçador",
    icon: Space,
    description: "Espaço vertical entre secções",
  },
  embed: {
    label: "Embed",
    icon: Code,
    description: "Incorporar YouTube, Instagram, etc.",
  },
  columns: {
    label: "Colunas",
    icon: Columns3,
    description: "Layout multi-coluna com texto e imagem",
  },
  testimonials: {
    label: "Testemunhos",
    icon: MessageSquareQuote,
    description: "Citações de clientes com avaliação",
  },
  countdown: {
    label: "Contagem Decrescente",
    icon: Timer,
    description: "Contagem regressiva para uma data",
  },
};

function getDefaultContent(type: SectionType): Record<string, unknown> {
  switch (type) {
    case "hero":
      return {
        title: "",
        subtitle: "",
        bgImage: "",
        ctaText: "",
        ctaLink: "",
        overlayOpacity: 50,
      };
    case "text":
      return { title: "", body: "", alignment: "left" };
    case "image_gallery":
      return { title: "", images: [""], columns: 3, gap: 4 };
    case "cta":
      return {
        title: "",
        description: "",
        buttonText: "",
        buttonLink: "",
        buttonStyle: "primary",
      };
    case "divider":
      return { style: "line", color: "#ffffff" };
    case "spacer":
      return { height: 40 };
    case "embed":
      return { url: "", width: 560, height: 315 };
    case "columns":
      return {
        count: 2,
        items: [
          { title: "", text: "", image: "" },
          { title: "", text: "", image: "" },
        ],
      };
    case "testimonials":
      return {
        items: [{ name: "", text: "", rating: 5 }],
      };
    case "countdown":
      return { targetDate: "", title: "", description: "" };
    default:
      return {};
  }
}

/* ================================================================== */
/* Main Page Component                                                 */
/* ================================================================== */

export default function SectionBuilderPage() {
  const [activeTab, setActiveTab] = useState<TabId>("homepage");
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchSections = useCallback(async (page: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sections?page=${page}`);
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      const parsed: SectionItem[] = data.map((s: Record<string, unknown>) => ({
        ...s,
        content: typeof s.content === "string" ? JSON.parse(s.content as string) : s.content,
        spacing: s.spacing
          ? typeof s.spacing === "string"
            ? JSON.parse(s.spacing as string)
            : s.spacing
          : { ...defaultSpacing },
        _expanded: false,
        _spacingOpen: false,
      }));
      setSections(parsed);
      setHasChanges(false);
    } catch {
      setError("Erro ao carregar secções.");
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections(activeTab);
  }, [activeTab, fetchSections]);

  const handleTabChange = (tab: TabId) => {
    if (hasChanges) {
      if (!window.confirm("Tens alterações por guardar. Queres mudar de página?")) return;
    }
    setActiveTab(tab);
  };

  const addSection = async (type: SectionType) => {
    setShowAddModal(false);
    setError("");
    try {
      const newOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.order)) + 1 : 0;
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: activeTab,
          type,
          content: JSON.stringify(getDefaultContent(type)),
          order: newOrder,
          visible: true,
          spacing: JSON.stringify(defaultSpacing),
        }),
      });
      if (!res.ok) throw new Error("Erro ao criar");
      const created = await res.json();
      const parsed: SectionItem = {
        ...created,
        content: typeof created.content === "string" ? JSON.parse(created.content) : created.content,
        spacing: created.spacing
          ? typeof created.spacing === "string"
            ? JSON.parse(created.spacing)
            : created.spacing
          : { ...defaultSpacing },
        _expanded: true,
        _spacingOpen: false,
      };
      setSections((prev) => [...prev, parsed]);
    } catch {
      setError("Erro ao adicionar secção.");
    }
  };

  const deleteSection = async (id: string) => {
    if (!window.confirm("Tens a certeza que queres apagar esta secção?")) return;
    setError("");
    try {
      const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao apagar");
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Erro ao apagar secção.");
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;
    const tempOrder = newSections[index].order;
    newSections[index].order = newSections[swapIndex].order;
    newSections[swapIndex].order = tempOrder;
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    setSections(newSections);
    setHasChanges(true);
  };

  const toggleVisibility = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s))
    );
    setHasChanges(true);
  };

  const toggleExpand = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, _expanded: !s._expanded } : s))
    );
  };

  const toggleSpacing = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, _spacingOpen: !s._spacingOpen } : s))
    );
  };

  const updateContent = (index: number, key: string, value: unknown) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, content: { ...s.content, [key]: value } } : s
      )
    );
    setHasChanges(true);
  };

  const updateSpacing = (index: number, key: keyof SpacingData, value: unknown) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, spacing: { ...s.spacing, [key]: value } } : s
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const payload = sections.map((s) => ({
        id: s.id,
        page: s.page || activeTab,
        type: s.type,
        content: JSON.stringify(s.content),
        order: s.order,
        visible: s.visible,
        spacing: JSON.stringify(s.spacing),
      }));
      const res = await fetch("/api/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao guardar");
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erro ao guardar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Construtor de Secções</h1>
          <p className="text-gray-400 text-sm mt-1">
            Adiciona, reordena e edita as secções de cada página.
          </p>
        </div>
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
          {hasChanges && (
            <span className="text-yellow-400 text-xs uppercase tracking-wider">
              Alterações por guardar
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
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
              onClick={() => handleTabChange(tab.id)}
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

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : (
        <div className="space-y-4">
          {sections.length === 0 && (
            <div className="text-center py-16 bg-jungle-900/30 border border-jungle-700/20 rounded-sm">
              <Box size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">Nenhuma secção nesta página.</p>
              <p className="text-gray-500 text-sm">Clica em &quot;Adicionar Secção&quot; para começar.</p>
            </div>
          )}

          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              onToggleExpand={() => toggleExpand(index)}
              onToggleSpacing={() => toggleSpacing(index)}
              onToggleVisibility={() => toggleVisibility(index)}
              onMoveUp={() => moveSection(index, "up")}
              onMoveDown={() => moveSection(index, "down")}
              onDelete={() => deleteSection(section.id)}
              onUpdateContent={(key, value) => updateContent(index, key, value)}
              onUpdateSpacing={(key, value) => updateSpacing(index, key, value)}
            />
          ))}

          {/* Add Section Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 border-2 border-dashed border-jungle-700/50 rounded-sm text-gray-400 hover:text-white hover:border-jungle-500/50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Adicionar Secção
          </button>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddModal && (
        <AddSectionModal
          onAdd={addSection}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* Section Card                                                        */
/* ================================================================== */

function SectionCard({
  section,
  index,
  total,
  onToggleExpand,
  onToggleSpacing,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdateContent,
  onUpdateSpacing,
}: {
  section: SectionItem;
  index: number;
  total: number;
  onToggleExpand: () => void;
  onToggleSpacing: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onUpdateContent: (key: string, value: unknown) => void;
  onUpdateSpacing: (key: keyof SpacingData, value: unknown) => void;
}) {
  const meta = sectionTypeMeta[section.type];
  const Icon = meta?.icon || Layout;

  return (
    <div
      className={cn(
        "bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden",
        !section.visible && "opacity-60"
      )}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical size={16} className="text-gray-600 flex-shrink-0" />

        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="p-2 bg-jungle-800/80 rounded-sm border border-jungle-700/30">
            <Icon size={16} className="text-jungle-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{meta?.label || section.type}</span>
              <span className="text-xs text-gray-500">#{index + 1}</span>
              {!section.visible && (
                <span className="text-xs text-yellow-500/70 bg-yellow-500/10 px-2 py-0.5 rounded-sm">
                  Oculto
                </span>
              )}
            </div>
            {section.content.title ? (
              <p className="text-xs text-gray-500 truncate">
                {String(section.content.title)}
              </p>
            ) : null}
          </div>
          <ChevronRight
            size={16}
            className={cn(
              "text-gray-500 transition-transform",
              section._expanded && "rotate-90"
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
            title="Mover para cima"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
            title="Mover para baixo"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onToggleVisibility}
            className="p-1.5 text-gray-500 hover:text-white transition-colors"
            title={section.visible ? "Ocultar" : "Mostrar"}
          >
            {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
            title="Apagar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {section._expanded && (
        <div className="border-t border-jungle-700/30 px-4 py-4 space-y-4">
          <SectionEditor
            type={section.type}
            content={section.content}
            onUpdate={onUpdateContent}
          />

          {/* Spacing Toggle */}
          <button
            onClick={onToggleSpacing}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight
              size={14}
              className={cn("transition-transform", section._spacingOpen && "rotate-90")}
            />
            Espaçamento e Fundo
          </button>

          {section._spacingOpen && (
            <SpacingEditor spacing={section.spacing} onUpdate={onUpdateSpacing} />
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* Section Type Editors                                                */
/* ================================================================== */

function SectionEditor({
  type,
  content,
  onUpdate,
}: {
  type: SectionType;
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  switch (type) {
    case "hero":
      return <HeroEditor content={content} onUpdate={onUpdate} />;
    case "text":
      return <TextEditor content={content} onUpdate={onUpdate} />;
    case "image_gallery":
      return <ImageGalleryEditor content={content} onUpdate={onUpdate} />;
    case "cta":
      return <CTAEditor content={content} onUpdate={onUpdate} />;
    case "divider":
      return <DividerEditor content={content} onUpdate={onUpdate} />;
    case "spacer":
      return <SpacerEditor content={content} onUpdate={onUpdate} />;
    case "embed":
      return <EmbedEditor content={content} onUpdate={onUpdate} />;
    case "columns":
      return <ColumnsEditor content={content} onUpdate={onUpdate} />;
    case "testimonials":
      return <TestimonialsEditor content={content} onUpdate={onUpdate} />;
    case "countdown":
      return <CountdownEditor content={content} onUpdate={onUpdate} />;
    default:
      return <p className="text-gray-500 text-sm">Editor não disponível para este tipo.</p>;
  }
}

type EditorProps = {
  content: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
};

/* ---------- Input helpers ---------- */

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
      />
    </div>
  );
}

function FieldTextArea({
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

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FieldSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 200,
  unit = "px",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">
        {label}: <span className="text-jungle-400">{value}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-jungle-500"
      />
    </div>
  );
}

/* ---------- Hero ---------- */

function HeroEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldInput
        label="Título"
        value={String(content.title || "")}
        onChange={(v) => onUpdate("title", v)}
        placeholder="Título do hero"
      />
      <FieldInput
        label="Subtítulo"
        value={String(content.subtitle || "")}
        onChange={(v) => onUpdate("subtitle", v)}
        placeholder="Subtítulo do hero"
      />
      <FieldInput
        label="Imagem de Fundo (URL)"
        value={String(content.bgImage || "")}
        onChange={(v) => onUpdate("bgImage", v)}
        placeholder="https://..."
      />
      <div className="grid grid-cols-2 gap-4">
        <FieldInput
          label="Texto do Botão CTA"
          value={String(content.ctaText || "")}
          onChange={(v) => onUpdate("ctaText", v)}
          placeholder="Reservar Mesa"
        />
        <FieldInput
          label="Link do Botão CTA"
          value={String(content.ctaLink || "")}
          onChange={(v) => onUpdate("ctaLink", v)}
          placeholder="/reservas"
        />
      </div>
      <FieldSlider
        label="Opacidade do Overlay"
        value={Number(content.overlayOpacity || 50)}
        onChange={(v) => onUpdate("overlayOpacity", v)}
        min={0}
        max={100}
        unit="%"
      />
    </div>
  );
}

/* ---------- Text ---------- */

function TextEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldInput
        label="Título (opcional)"
        value={String(content.title || "")}
        onChange={(v) => onUpdate("title", v)}
      />
      <FieldTextArea
        label="Corpo do Texto"
        value={String(content.body || "")}
        onChange={(v) => onUpdate("body", v)}
        rows={6}
      />
      <FieldSelect
        label="Alinhamento"
        value={String(content.alignment || "left")}
        onChange={(v) => onUpdate("alignment", v)}
        options={[
          { value: "left", label: "Esquerda" },
          { value: "center", label: "Centro" },
          { value: "right", label: "Direita" },
        ]}
      />
    </div>
  );
}

/* ---------- Image Gallery ---------- */

function ImageGalleryEditor({ content, onUpdate }: EditorProps) {
  const images = (Array.isArray(content.images) ? content.images : [""]) as string[];

  const updateImage = (idx: number, val: string) => {
    const newImages = [...images];
    newImages[idx] = val;
    onUpdate("images", newImages);
  };

  const addImage = () => onUpdate("images", [...images, ""]);

  const removeImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    onUpdate("images", newImages.length ? newImages : [""]);
  };

  return (
    <div className="space-y-4">
      <FieldInput
        label="Título"
        value={String(content.title || "")}
        onChange={(v) => onUpdate("title", v)}
      />
      <div>
        <label className="block text-sm text-gray-300 mb-1.5">Imagens</label>
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={img}
                onChange={(e) => updateImage(idx, e.target.value)}
                placeholder="URL da imagem"
                className="flex-1 px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
              />
              <button
                onClick={() => removeImage(idx)}
                className="px-2 text-gray-500 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addImage}
          className="mt-2 text-sm text-jungle-400 hover:text-jungle-300 flex items-center gap-1"
        >
          <Plus size={14} /> Adicionar imagem
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FieldSelect
          label="Colunas"
          value={String(content.columns || 3)}
          onChange={(v) => onUpdate("columns", Number(v))}
          options={[
            { value: "2", label: "2 Colunas" },
            { value: "3", label: "3 Colunas" },
            { value: "4", label: "4 Colunas" },
          ]}
        />
        <FieldSlider
          label="Espaçamento"
          value={Number(content.gap || 4)}
          onChange={(v) => onUpdate("gap", v)}
          min={0}
          max={16}
          unit="px"
        />
      </div>
    </div>
  );
}

/* ---------- CTA ---------- */

function CTAEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldInput
        label="Título"
        value={String(content.title || "")}
        onChange={(v) => onUpdate("title", v)}
      />
      <FieldTextArea
        label="Descrição"
        value={String(content.description || "")}
        onChange={(v) => onUpdate("description", v)}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <FieldInput
          label="Texto do Botão"
          value={String(content.buttonText || "")}
          onChange={(v) => onUpdate("buttonText", v)}
        />
        <FieldInput
          label="Link do Botão"
          value={String(content.buttonLink || "")}
          onChange={(v) => onUpdate("buttonLink", v)}
        />
      </div>
      <FieldSelect
        label="Estilo do Botão"
        value={String(content.buttonStyle || "primary")}
        onChange={(v) => onUpdate("buttonStyle", v)}
        options={[
          { value: "primary", label: "Primário" },
          { value: "outline", label: "Contorno" },
          { value: "neon", label: "Neon" },
        ]}
      />
    </div>
  );
}

/* ---------- Divider ---------- */

function DividerEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldSelect
        label="Estilo"
        value={String(content.style || "line")}
        onChange={(v) => onUpdate("style", v)}
        options={[
          { value: "line", label: "Linha" },
          { value: "gradient", label: "Gradiente" },
          { value: "dots", label: "Pontos" },
          { value: "neon", label: "Neon" },
        ]}
      />
      <div>
        <label className="block text-sm text-gray-300 mb-1.5">Cor</label>
        <input
          type="color"
          value={String(content.color || "#ffffff")}
          onChange={(e) => onUpdate("color", e.target.value)}
          className="h-10 w-20 bg-jungle-900 border border-jungle-700/50 rounded-sm cursor-pointer"
        />
      </div>
    </div>
  );
}

/* ---------- Spacer ---------- */

function SpacerEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldSlider
        label="Altura"
        value={Number(content.height || 40)}
        onChange={(v) => onUpdate("height", v)}
        min={8}
        max={300}
        unit="px"
      />
      <div
        className="border border-dashed border-jungle-700/50 rounded-sm flex items-center justify-center text-xs text-gray-500"
        style={{ height: Number(content.height || 40) }}
      >
        {String(content.height || 40)}px
      </div>
    </div>
  );
}

/* ---------- Embed ---------- */

function EmbedEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldInput
        label="URL (YouTube, Instagram, etc.)"
        value={String(content.url || "")}
        onChange={(v) => onUpdate("url", v)}
        placeholder="https://youtube.com/watch?v=..."
      />
      <div className="grid grid-cols-2 gap-4">
        <FieldSlider
          label="Largura"
          value={Number(content.width || 560)}
          onChange={(v) => onUpdate("width", v)}
          min={200}
          max={1200}
          unit="px"
        />
        <FieldSlider
          label="Altura"
          value={Number(content.height || 315)}
          onChange={(v) => onUpdate("height", v)}
          min={100}
          max={800}
          unit="px"
        />
      </div>
    </div>
  );
}

/* ---------- Columns ---------- */

function ColumnsEditor({ content, onUpdate }: EditorProps) {
  const count = Number(content.count || 2);
  const items = (Array.isArray(content.items) ? content.items : []) as {
    title: string;
    text: string;
    image: string;
  }[];

  const updateColumnCount = (newCount: number) => {
    const newItems = [...items];
    while (newItems.length < newCount) newItems.push({ title: "", text: "", image: "" });
    while (newItems.length > newCount) newItems.pop();
    onUpdate("count", newCount);
    onUpdate("items", newItems);
  };

  const updateItem = (idx: number, key: string, val: string) => {
    const newItems = items.map((item, i) =>
      i === idx ? { ...item, [key]: val } : item
    );
    onUpdate("items", newItems);
  };

  return (
    <div className="space-y-4">
      <FieldSelect
        label="Número de Colunas"
        value={String(count)}
        onChange={(v) => updateColumnCount(Number(v))}
        options={[
          { value: "2", label: "2 Colunas" },
          { value: "3", label: "3 Colunas" },
          { value: "4", label: "4 Colunas" },
        ]}
      />
      <div className="space-y-4">
        {items.slice(0, count).map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-jungle-900/80 border border-jungle-700/20 rounded-sm space-y-3"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Coluna {idx + 1}
            </p>
            <FieldInput
              label="Título"
              value={item.title || ""}
              onChange={(v) => updateItem(idx, "title", v)}
            />
            <FieldTextArea
              label="Texto"
              value={item.text || ""}
              onChange={(v) => updateItem(idx, "text", v)}
              rows={3}
            />
            <FieldInput
              label="Imagem (URL)"
              value={item.image || ""}
              onChange={(v) => updateItem(idx, "image", v)}
              placeholder="https://..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Testimonials ---------- */

function TestimonialsEditor({ content, onUpdate }: EditorProps) {
  const items = (Array.isArray(content.items) ? content.items : []) as {
    name: string;
    text: string;
    rating: number;
  }[];

  const updateItem = (idx: number, key: string, val: unknown) => {
    const newItems = items.map((item, i) =>
      i === idx ? { ...item, [key]: val } : item
    );
    onUpdate("items", newItems);
  };

  const addItem = () =>
    onUpdate("items", [...items, { name: "", text: "", rating: 5 }]);

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    onUpdate("items", newItems.length ? newItems : [{ name: "", text: "", rating: 5 }]);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="p-3 bg-jungle-900/80 border border-jungle-700/20 rounded-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Testemunho {idx + 1}
            </p>
            <button
              onClick={() => removeItem(idx)}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <FieldInput
            label="Nome"
            value={item.name || ""}
            onChange={(v) => updateItem(idx, "name", v)}
          />
          <FieldTextArea
            label="Texto"
            value={item.text || ""}
            onChange={(v) => updateItem(idx, "text", v)}
            rows={3}
          />
          <FieldSelect
            label="Avaliação"
            value={String(item.rating || 5)}
            onChange={(v) => updateItem(idx, "rating", Number(v))}
            options={[
              { value: "1", label: "1 Estrela" },
              { value: "2", label: "2 Estrelas" },
              { value: "3", label: "3 Estrelas" },
              { value: "4", label: "4 Estrelas" },
              { value: "5", label: "5 Estrelas" },
            ]}
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="text-sm text-jungle-400 hover:text-jungle-300 flex items-center gap-1"
      >
        <Plus size={14} /> Adicionar testemunho
      </button>
    </div>
  );
}

/* ---------- Countdown ---------- */

function CountdownEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldInput
        label="Título"
        value={String(content.title || "")}
        onChange={(v) => onUpdate("title", v)}
      />
      <FieldTextArea
        label="Descrição"
        value={String(content.description || "")}
        onChange={(v) => onUpdate("description", v)}
        rows={3}
      />
      <FieldInput
        label="Data Alvo"
        value={String(content.targetDate || "")}
        onChange={(v) => onUpdate("targetDate", v)}
        type="datetime-local"
      />
    </div>
  );
}

/* ================================================================== */
/* Spacing Editor                                                      */
/* ================================================================== */

function SpacingEditor({
  spacing,
  onUpdate,
}: {
  spacing: SpacingData;
  onUpdate: (key: keyof SpacingData, value: unknown) => void;
}) {
  return (
    <div className="p-4 bg-jungle-900/80 border border-jungle-700/20 rounded-sm space-y-6">
      {/* Box Model Visual */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Modelo de Caixa
        </p>
        <div className="flex justify-center">
          <div className="relative">
            {/* Margin layer */}
            <div
              className="border-2 border-dashed border-yellow-500/30 p-1"
              style={{ borderRadius: spacing.borderRadius }}
            >
              <div className="text-[10px] text-yellow-500/50 text-center mb-0.5">
                M: {spacing.marginTop}
              </div>
              <div className="flex items-center">
                <div className="text-[10px] text-yellow-500/50 px-1">
                  {spacing.marginTop > 0 ? "" : ""}
                </div>
                {/* Padding layer */}
                <div className="border-2 border-dashed border-green-500/30 p-1 min-w-[120px]">
                  <div className="text-[10px] text-green-500/50 text-center mb-0.5">
                    P: {spacing.paddingTop}
                  </div>
                  <div className="flex items-center">
                    <div className="text-[10px] text-green-500/50 px-1">
                      {spacing.paddingLeft}
                    </div>
                    <div className="flex-1 bg-jungle-700/30 rounded-sm px-3 py-2 text-center text-[10px] text-gray-500 min-w-[60px]">
                      Conteúdo
                    </div>
                    <div className="text-[10px] text-green-500/50 px-1">
                      {spacing.paddingRight}
                    </div>
                  </div>
                  <div className="text-[10px] text-green-500/50 text-center mt-0.5">
                    P: {spacing.paddingBottom}
                  </div>
                </div>
                <div className="text-[10px] text-yellow-500/50 px-1">
                  {spacing.marginBottom > 0 ? "" : ""}
                </div>
              </div>
              <div className="text-[10px] text-yellow-500/50 text-center mt-0.5">
                M: {spacing.marginBottom}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Margins */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Margens
        </p>
        <div className="grid grid-cols-2 gap-4">
          <FieldSlider
            label="Margem Superior"
            value={spacing.marginTop}
            onChange={(v) => onUpdate("marginTop", v)}
            max={200}
          />
          <FieldSlider
            label="Margem Inferior"
            value={spacing.marginBottom}
            onChange={(v) => onUpdate("marginBottom", v)}
            max={200}
          />
        </div>
      </div>

      {/* Paddings */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Preenchimento (Padding)
        </p>
        <div className="grid grid-cols-2 gap-4">
          <FieldSlider
            label="Topo"
            value={spacing.paddingTop}
            onChange={(v) => onUpdate("paddingTop", v)}
            max={100}
          />
          <FieldSlider
            label="Direita"
            value={spacing.paddingRight}
            onChange={(v) => onUpdate("paddingRight", v)}
            max={100}
          />
          <FieldSlider
            label="Baixo"
            value={spacing.paddingBottom}
            onChange={(v) => onUpdate("paddingBottom", v)}
            max={100}
          />
          <FieldSlider
            label="Esquerda"
            value={spacing.paddingLeft}
            onChange={(v) => onUpdate("paddingLeft", v)}
            max={100}
          />
        </div>
      </div>

      {/* Layout */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Layout
        </p>
        <div className="grid grid-cols-2 gap-4">
          <FieldSelect
            label="Largura Máxima"
            value={spacing.maxWidth}
            onChange={(v) => onUpdate("maxWidth", v)}
            options={[
              { value: "full", label: "Completa (100%)" },
              { value: "7xl", label: "7xl (80rem)" },
              { value: "6xl", label: "6xl (72rem)" },
              { value: "5xl", label: "5xl (64rem)" },
              { value: "4xl", label: "4xl (56rem)" },
            ]}
          />
          <FieldSlider
            label="Arredondamento"
            value={spacing.borderRadius}
            onChange={(v) => onUpdate("borderRadius", v)}
            max={32}
          />
        </div>
      </div>

      {/* Background */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Fundo
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">
              Cor de Fundo
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={spacing.bgColor || "#000000"}
                onChange={(e) => onUpdate("bgColor", e.target.value)}
                className="h-10 w-14 bg-jungle-900 border border-jungle-700/50 rounded-sm cursor-pointer"
              />
              <input
                type="text"
                value={spacing.bgColor || ""}
                onChange={(e) => onUpdate("bgColor", e.target.value)}
                placeholder="Nenhuma"
                className="flex-1 px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
              />
              {spacing.bgColor && (
                <button
                  onClick={() => onUpdate("bgColor", "")}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <FieldInput
            label="Gradiente CSS"
            value={spacing.bgGradient || ""}
            onChange={(v) => onUpdate("bgGradient", v)}
            placeholder="linear-gradient(135deg, #000, #111)"
          />
          <FieldInput
            label="Imagem de Fundo (URL)"
            value={spacing.bgImage || ""}
            onChange={(v) => onUpdate("bgImage", v)}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Add Section Modal                                                   */
/* ================================================================== */

function AddSectionModal({
  onAdd,
  onClose,
}: {
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}) {
  const types = Object.entries(sectionTypeMeta) as [
    SectionType,
    (typeof sectionTypeMeta)[SectionType],
  ][];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-jungle-900 border border-jungle-700/50 rounded-sm w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-jungle-700/30">
          <h2 className="text-lg font-semibold text-white">Adicionar Secção</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {types.map(([type, meta]) => {
            const Icon = meta.icon;
            return (
              <button
                key={type}
                onClick={() => onAdd(type)}
                className="flex items-start gap-3 p-4 bg-jungle-900/50 border border-jungle-700/30 rounded-sm hover:bg-jungle-800/50 hover:border-jungle-600/50 transition-all text-left"
              >
                <div className="p-2 bg-jungle-800/80 rounded-sm border border-jungle-700/30 flex-shrink-0">
                  <Icon size={18} className="text-jungle-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{meta.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
