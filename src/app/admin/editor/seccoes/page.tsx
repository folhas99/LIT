"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  ExternalLink,
  Copy,
  Sliders,
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
  Heading1,
  Home,
  CalendarDays,
  CalendarRange,
  Images,
  GalleryVerticalEnd,
  PhoneCall,
  Contact,
  Send,
  Map,
  Crown,
  LayoutGrid,
  MapPin,
  Clock,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  ListChecks,
  Hash,
  Sparkles,
  PanelTop,
  Tag,
  Rows3,
  Building2,
  Star,
  Heart,
  Award,
  Gift,
  Music,
  Zap,
  Shield,
  Wine,
  GlassWater,
  Users,
} from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaPicker, { MediaField } from "@/components/admin/MediaPicker";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  | "countdown"
  | "page_header"
  | "hero_home"
  | "next_event_countdown"
  | "events_preview"
  | "events_grid"
  | "galleries_preview"
  | "galleries_grid"
  | "contact_cta"
  | "contact_info"
  | "contact_form"
  | "contact_map"
  | "reservation_form"
  | "info_cards"
  | "heading"
  | "icon_box"
  | "accordion"
  | "stats"
  | "tabs"
  | "pricing"
  | "button_group"
  | "logos";

type RevealAnim =
  | "none"
  | "fadeIn"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "zoomIn";

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
  /** Colour layered above bgImage / bgVideo (use rgba for transparency). */
  bgOverlay?: string;
  /** Background video URL that loops behind the section content. */
  bgVideo?: string;
  /** Entry animation when scrolling into view. */
  animation?: RevealAnim;
  animationDelay?: number;
  /** Hide on selected breakpoints. */
  hideOn?: Array<"mobile" | "tablet" | "desktop">;
  /** HTML id for in-page anchor links (no `#`). */
  anchorId?: string;
  /** Extra CSS classes appended to the section root. */
  customClass?: string;
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
  _advancedOpen?: boolean;
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
  bgOverlay: "",
  bgVideo: "",
  animation: "none",
  animationDelay: 0,
  hideOn: [],
  anchorId: "",
  customClass: "",
};

interface PageTab {
  id: string;
  label: string;
  url: string;
  system: boolean;
  published: boolean;
}

const SYSTEM_URLS: Record<string, string> = {
  homepage: "/",
  sobre: "/sobre",
  contacto: "/contacto",
  reservas: "/reservas",
  eventos: "/eventos",
  galeria: "/galeria",
};

interface PageRecord {
  id: string;
  slug: string;
  title: string;
  system: boolean;
  published: boolean;
}

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
  page_header: {
    label: "Cabeçalho de Página",
    icon: Heading1,
    description: "Título grande + subtítulo com divisor colorido",
  },
  hero_home: {
    label: "Hero Homepage",
    icon: Home,
    description: "Banner full-bleed da homepage (usa vídeo/imagem das definições)",
  },
  next_event_countdown: {
    label: "Countdown Próximo Evento",
    icon: Timer,
    description: "Bloco destaque com contagem para o próximo evento publicado",
  },
  events_preview: {
    label: "Pré-visualização de Eventos",
    icon: CalendarDays,
    description: "Lista compacta dos próximos eventos (homepage)",
  },
  events_grid: {
    label: "Grelha de Eventos",
    icon: CalendarRange,
    description: "Grelha completa com filtros de eventos publicados",
  },
  galleries_preview: {
    label: "Pré-visualização de Galerias",
    icon: Images,
    description: "Galerias recentes para homepage",
  },
  galleries_grid: {
    label: "Grelha de Galerias",
    icon: GalleryVerticalEnd,
    description: "Grelha completa de galerias com filtros",
  },
  contact_cta: {
    label: "CTA Contacto",
    icon: PhoneCall,
    description: "Bloco de redes sociais + email a convidar ao contacto",
  },
  contact_info: {
    label: "Info de Contacto",
    icon: Contact,
    description: "Lista de email, telefone, morada e redes das definições",
  },
  contact_form: {
    label: "Formulário de Contacto",
    icon: Send,
    description: "Formulário público de contacto",
  },
  contact_map: {
    label: "Mapa de Contacto",
    icon: Map,
    description: "Mapa com localização das definições",
  },
  reservation_form: {
    label: "Formulário de Reservas",
    icon: Crown,
    description: "Formulário VIP de reservas",
  },
  info_cards: {
    label: "Cartões Informativos",
    icon: LayoutGrid,
    description: "Grelha de cartões com ícone, título e texto",
  },
  heading: {
    label: "Cabeçalho",
    icon: Heading1,
    description: "Título destacado independente, com tamanho e alinhamento",
  },
  icon_box: {
    label: "Caixa de Ícones",
    icon: Sparkles,
    description: "Grelha de funcionalidades com ícone + título + descrição",
  },
  accordion: {
    label: "Acordeão / FAQ",
    icon: ListChecks,
    description: "Lista de perguntas e respostas colapsáveis",
  },
  stats: {
    label: "Estatísticas",
    icon: Hash,
    description: "Números animados (contadores) lado a lado",
  },
  tabs: {
    label: "Separadores",
    icon: PanelTop,
    description: "Painéis com separadores horizontais ou verticais",
  },
  pricing: {
    label: "Tabela de Preços",
    icon: Tag,
    description: "Cartões de pacotes / mesas VIP com preço e features",
  },
  button_group: {
    label: "Grupo de Botões",
    icon: Rows3,
    description: "Linha de CTAs lado a lado (estilo barra de ações)",
  },
  logos: {
    label: "Logos / Parceiros",
    icon: Building2,
    description: "Faixa de logos de parceiros ou patrocinadores",
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
    case "page_header":
      return { title: "", titleEn: "", subtitle: "", subtitleEn: "", accent: "neon-green" };
    case "hero_home":
      return {
        title: "",
        titleEn: "",
        subtitle: "",
        subtitleEn: "",
        heroImage: "",
        heroVideo: "",
        showReservations: true,
      };
    case "next_event_countdown":
      return {};
    case "events_preview":
      return { limit: 4 };
    case "events_grid":
      return { title: "", titleEn: "" };
    case "galleries_preview":
      return { limit: 6 };
    case "galleries_grid":
      return { title: "", titleEn: "" };
    case "contact_cta":
      return { email: "", instagram: "", facebook: "" };
    case "contact_info":
      return {
        title: "",
        titleEn: "",
        intro: "",
        introEn: "",
        showEmail: true,
        showPhone: true,
        showAddress: true,
        showSocials: true,
      };
    case "contact_form":
      return { title: "", titleEn: "" };
    case "contact_map":
      return { title: "", titleEn: "", lat: "", lng: "", zoom: 16 };
    case "reservation_form":
      return {
        title: "",
        titleEn: "",
        subtitle: "",
        subtitleEn: "",
        showEventSelector: true,
        showHeader: true,
      };
    case "info_cards":
      return {
        title: "",
        titleEn: "",
        columns: 2,
        items: [
          { icon: "mapPin", title: "", titleEn: "", text: "", textEn: "", link: "" },
        ],
      };
    case "heading":
      return {
        text: "",
        textEn: "",
        level: "h2",
        align: "left",
        size: "lg",
        decoration: false,
      };
    case "icon_box":
      return {
        title: "",
        titleEn: "",
        intro: "",
        introEn: "",
        columns: 3,
        layout: "centered",
        items: [
          { icon: "sparkles", title: "", titleEn: "", text: "", textEn: "" },
          { icon: "music", title: "", titleEn: "", text: "", textEn: "" },
          { icon: "crown", title: "", titleEn: "", text: "", textEn: "" },
        ],
      };
    case "accordion":
      return {
        title: "",
        titleEn: "",
        intro: "",
        introEn: "",
        items: [
          { question: "", questionEn: "", answer: "", answerEn: "" },
        ],
      };
    case "stats":
      return {
        items: [
          { value: 100, label: "", labelEn: "", prefix: "", suffix: "+", duration: 1500 },
          { value: 25, label: "", labelEn: "", prefix: "", suffix: "k", duration: 1500 },
        ],
      };
    case "tabs":
      return {
        title: "",
        titleEn: "",
        intro: "",
        introEn: "",
        layout: "horizontal",
        items: [
          { label: "Tab 1", labelEn: "Tab 1", body: "", bodyEn: "" },
          { label: "Tab 2", labelEn: "Tab 2", body: "", bodyEn: "" },
        ],
      };
    case "pricing":
      return {
        title: "",
        titleEn: "",
        intro: "",
        introEn: "",
        columns: 3,
        items: [
          {
            name: "Standard",
            nameEn: "Standard",
            price: "€150",
            priceLabel: "/ mesa",
            priceLabelEn: "/ table",
            description: "",
            descriptionEn: "",
            features: ["Mesa para 4 pessoas"],
            featuresEn: ["Table for 4"],
            ctaText: "Reservar",
            ctaTextEn: "Book",
            ctaLink: "/reservas",
            highlight: false,
            badge: "",
            badgeEn: "",
          },
          {
            name: "VIP",
            nameEn: "VIP",
            price: "€350",
            priceLabel: "/ mesa",
            priceLabelEn: "/ table",
            description: "",
            descriptionEn: "",
            features: ["Mesa para 6", "Garrafa premium incluída"],
            featuresEn: ["Table for 6", "Premium bottle included"],
            ctaText: "Reservar",
            ctaTextEn: "Book",
            ctaLink: "/reservas",
            highlight: true,
            badge: "Popular",
            badgeEn: "Popular",
          },
        ],
      };
    case "button_group":
      return {
        align: "center",
        layout: "row",
        buttons: [
          { label: "Reservar", labelEn: "Book", link: "/reservas", style: "primary", icon: "" },
          { label: "Eventos", labelEn: "Events", link: "/eventos", style: "secondary", icon: "" },
        ],
      };
    case "logos":
      return {
        title: "",
        titleEn: "",
        columns: 5,
        grayscale: true,
        items: [
          { src: "", alt: "", href: "" },
        ],
      };
    default:
      return {};
  }
}

/* ================================================================== */
/* Main Page Component                                                 */
/* ================================================================== */

export default function SectionBuilderPageWrapper() {
  return (
    <Suspense fallback={<p className="text-gray-500">A carregar...</p>}>
      <SectionBuilderPage />
    </Suspense>
  );
}

function SectionBuilderPage() {
  const searchParams = useSearchParams();
  const requestedPage = searchParams?.get("page") ?? null;

  const [pages, setPages] = useState<PageTab[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(requestedPage || "homepage");
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load pages list dynamically (system + custom).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pages");
        if (!res.ok) throw new Error("Erro ao carregar páginas");
        const data: PageRecord[] = await res.json();
        if (cancelled) return;
        const list: PageTab[] = data.map((p) => ({
          id: p.slug,
          label: p.title,
          url: p.system ? SYSTEM_URLS[p.slug] ?? `/p/${p.slug}` : `/p/${p.slug}`,
          system: p.system,
          published: p.published,
        }));
        setPages(list);
        // If the requested page exists, switch to it; otherwise keep current/default.
        if (requestedPage && list.some((p) => p.id === requestedPage)) {
          setActiveTab(requestedPage);
        } else if (!list.some((p) => p.id === activeTab) && list.length > 0) {
          setActiveTab(list[0].id);
        }
      } catch {
        // Fallback: keep empty pages list; sections fetch will still work for current activeTab.
      } finally {
        if (!cancelled) setPagesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedPage]);

  const activeTabMeta = useMemo(
    () => pages.find((p) => p.id === activeTab) ?? null,
    [pages, activeTab]
  );

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
        _advancedOpen: false,
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

  const handleTabChange = (tab: string) => {
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
        _advancedOpen: false,
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

  /**
   * Duplicate a section by POSTing a copy of its content + spacing as a new
   * row appended to the end of the page. Mirrors the "Duplicar" pattern
   * Elementor users expect.
   */
  const duplicateSection = async (section: SectionItem) => {
    setError("");
    try {
      const newOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.order)) + 1 : 0;
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: section.page,
          type: section.type,
          content: JSON.stringify(section.content),
          order: newOrder,
          visible: section.visible,
          spacing: JSON.stringify(section.spacing),
        }),
      });
      if (!res.ok) throw new Error("Erro ao duplicar");
      const created = await res.json();
      const parsed: SectionItem = {
        ...created,
        content: typeof created.content === "string" ? JSON.parse(created.content) : created.content,
        spacing: created.spacing
          ? typeof created.spacing === "string"
            ? JSON.parse(created.spacing)
            : created.spacing
          : { ...defaultSpacing },
        _expanded: false,
        _spacingOpen: false,
        _advancedOpen: false,
      };
      setSections((prev) => [...prev, parsed]);
    } catch {
      setError("Erro ao duplicar secção.");
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
      ...s,
      order: idx,
    }));
    setSections(reordered);
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

  const toggleAdvanced = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, _advancedOpen: !s._advancedOpen } : s))
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

  const handlePreview = async () => {
    const tab = activeTabMeta;
    if (!tab) return;
    if (hasChanges) {
      const confirmed = window.confirm(
        "Tens alterações por guardar. Queres guardá-las e pré-visualizar? (Cancelar abre a versão publicada atual)"
      );
      if (confirmed) {
        await handleSave();
      }
    }
    const url = `${tab.url}?_preview=${Date.now()}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 hover:border-jungle-500 text-gray-300 hover:text-white font-medium text-sm transition-colors rounded-sm"
            title="Abrir página pública em nova aba"
          >
            <ExternalLink size={16} />
            Pré-visualizar
          </button>
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
        {pagesLoading ? (
          <p className="px-3 py-3 text-xs text-gray-500">A carregar páginas...</p>
        ) : (
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {pages.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "px-5 py-3 text-sm font-medium tracking-wide transition-colors border-b-2 whitespace-nowrap flex items-center gap-2",
                  activeTab === tab.id
                    ? "border-jungle-500 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:border-jungle-700/50"
                )}
              >
                {tab.label}
                {!tab.system && (
                  <span className="text-[9px] uppercase tracking-widest text-jungle-400 bg-jungle-900/60 border border-jungle-700/40 px-1.5 py-0.5 rounded-sm">
                    Custom
                  </span>
                )}
                {!tab.published && (
                  <span className="text-[9px] uppercase tracking-widest text-yellow-300/80 bg-yellow-900/30 border border-yellow-700/30 px-1.5 py-0.5 rounded-sm">
                    Rascunho
                  </span>
                )}
              </button>
            ))}
          </nav>
        )}
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

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  total={sections.length}
                  onToggleExpand={() => toggleExpand(index)}
                  onToggleSpacing={() => toggleSpacing(index)}
                  onToggleAdvanced={() => toggleAdvanced(index)}
                  onToggleVisibility={() => toggleVisibility(index)}
                  onMoveUp={() => moveSection(index, "up")}
                  onMoveDown={() => moveSection(index, "down")}
                  onDuplicate={() => duplicateSection(section)}
                  onDelete={() => deleteSection(section.id)}
                  onUpdateContent={(key, value) => updateContent(index, key, value)}
                  onUpdateSpacing={(key, value) => updateSpacing(index, key, value)}
                />
              ))}
            </SortableContext>
          </DndContext>

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
  onToggleAdvanced,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onUpdateContent,
  onUpdateSpacing,
}: {
  section: SectionItem;
  index: number;
  total: number;
  onToggleExpand: () => void;
  onToggleSpacing: () => void;
  onToggleAdvanced: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdateContent: (key: string, value: unknown) => void;
  onUpdateSpacing: (key: keyof SpacingData, value: unknown) => void;
}) {
  const meta = sectionTypeMeta[section.type];
  const Icon = meta?.icon || Layout;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={cn(
        "bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden",
        !section.visible && "opacity-60",
        isDragging && "ring-2 ring-jungle-500/60 shadow-2xl bg-jungle-900/80"
      )}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 -m-1 text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0"
          aria-label="Arrastar para reordenar"
          title="Arrastar para reordenar"
        >
          <GripVertical size={16} />
        </button>

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
            onClick={onDuplicate}
            className="p-1.5 text-gray-500 hover:text-jungle-300 transition-colors"
            title="Duplicar"
          >
            <Copy size={16} />
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

          {/* Advanced (animation, responsive, anchor, custom class, overlay) */}
          <button
            onClick={onToggleAdvanced}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight
              size={14}
              className={cn("transition-transform", section._advancedOpen && "rotate-90")}
            />
            <Sliders size={14} /> Avançado
          </button>

          {section._advancedOpen && (
            <AdvancedEditor spacing={section.spacing} onUpdate={onUpdateSpacing} />
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
    case "page_header":
      return <PageHeaderEditor content={content} onUpdate={onUpdate} />;
    case "hero_home":
      return <HeroHomeEditor content={content} onUpdate={onUpdate} />;
    case "next_event_countdown":
      return <NextEventCountdownEditor content={content} onUpdate={onUpdate} />;
    case "events_preview":
      return <EventsPreviewEditor content={content} onUpdate={onUpdate} />;
    case "events_grid":
      return <EventsGridEditor content={content} onUpdate={onUpdate} />;
    case "galleries_preview":
      return <GalleriesPreviewEditor content={content} onUpdate={onUpdate} />;
    case "galleries_grid":
      return <GalleriesGridEditor content={content} onUpdate={onUpdate} />;
    case "contact_cta":
      return <ContactCtaEditor content={content} onUpdate={onUpdate} />;
    case "contact_info":
      return <ContactInfoEditor content={content} onUpdate={onUpdate} />;
    case "contact_form":
      return <ContactFormEditor content={content} onUpdate={onUpdate} />;
    case "contact_map":
      return <ContactMapEditor content={content} onUpdate={onUpdate} />;
    case "reservation_form":
      return <ReservationFormEditor content={content} onUpdate={onUpdate} />;
    case "info_cards":
      return <InfoCardsEditor content={content} onUpdate={onUpdate} />;
    case "heading":
      return <HeadingEditor content={content} onUpdate={onUpdate} />;
    case "icon_box":
      return <IconBoxEditor content={content} onUpdate={onUpdate} />;
    case "accordion":
      return <AccordionEditor content={content} onUpdate={onUpdate} />;
    case "stats":
      return <StatsEditor content={content} onUpdate={onUpdate} />;
    case "tabs":
      return <TabsEditor content={content} onUpdate={onUpdate} />;
    case "pricing":
      return <PricingEditor content={content} onUpdate={onUpdate} />;
    case "button_group":
      return <ButtonGroupEditor content={content} onUpdate={onUpdate} />;
    case "logos":
      return <LogosEditor content={content} onUpdate={onUpdate} />;
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
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
        placeholder="Título do hero"
      />
      <FieldBilingual
        label="Subtítulo"
        valuePt={String(content.subtitle || "")}
        valueEn={String(content.subtitleEn || "")}
        onChangePt={(v) => onUpdate("subtitle", v)}
        onChangeEn={(v) => onUpdate("subtitleEn", v)}
        placeholder="Subtítulo do hero"
      />
      <MediaField
        label="Imagem de Fundo"
        value={String(content.bgImage || "")}
        onChange={(v) => onUpdate("bgImage", v)}
        placeholder="URL ou escolher da biblioteca..."
      />
      <FieldBilingual
        label="Texto do Botão CTA"
        valuePt={String(content.ctaText || "")}
        valueEn={String(content.ctaTextEn || "")}
        onChangePt={(v) => onUpdate("ctaText", v)}
        onChangeEn={(v) => onUpdate("ctaTextEn", v)}
        placeholder="Reservar Mesa"
      />
      <FieldInput
        label="Link do Botão CTA"
        value={String(content.ctaLink || "")}
        onChange={(v) => onUpdate("ctaLink", v)}
        placeholder="/reservas"
      />
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
      <FieldBilingual
        label="Título (opcional)"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <RichTextEditor
        label="Corpo do Texto (PT)"
        value={String(content.body || "")}
        onChange={(v) => onUpdate("body", v)}
      />
      <RichTextEditor
        label="Corpo do Texto (EN)"
        value={String(content.bodyEn || "")}
        onChange={(v) => onUpdate("bodyEn", v)}
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
  const rawImages = (Array.isArray(content.images) ? content.images : []) as string[];
  // Keep only non-empty values in the rendered list; the editor no longer
  // needs a trailing empty input because we have a proper picker.
  const images = rawImages.filter(Boolean);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const commit = (list: string[]) => {
    onUpdate("images", list.length ? list : [""]);
  };

  const removeImage = (idx: number) => commit(images.filter((_, i) => i !== idx));

  const moveImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
  };

  const addFromUrl = () => {
    const v = urlInput.trim();
    if (!v) return;
    commit([...images, v]);
    setUrlInput("");
  };

  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm text-gray-300">
            Imagens {images.length > 0 && <span className="text-gray-500">({images.length})</span>}
          </label>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-jungle-700/60 hover:bg-jungle-600 border border-jungle-700/50 text-white text-xs rounded-sm transition-colors"
          >
            <Image size={13} /> Escolher da biblioteca
          </button>
        </div>

        {images.length === 0 ? (
          <div className="px-4 py-6 border border-dashed border-jungle-700/40 rounded-sm text-center text-gray-500 text-sm">
            Sem imagens. Clica em <span className="text-jungle-300">Escolher da biblioteca</span> ou cola um URL abaixo.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div
                key={`${img}-${idx}`}
                className="group relative aspect-square rounded-sm overflow-hidden border border-jungle-700/40 bg-jungle-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-jungle-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 bg-jungle-700/80 hover:bg-jungle-600 disabled:opacity-30 text-white rounded-sm"
                    title="Mover para trás"
                  >
                    <ChevronUp size={14} className="-rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === images.length - 1}
                    className="p-1 bg-jungle-700/80 hover:bg-jungle-600 disabled:opacity-30 text-white rounded-sm"
                    title="Mover para a frente"
                  >
                    <ChevronDown size={14} className="-rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1 bg-red-900/80 hover:bg-red-800 text-white rounded-sm"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick-add by URL */}
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFromUrl();
              }
            }}
            placeholder="Colar URL externo..."
            className="flex-1 px-3 py-2 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white text-xs focus:outline-none focus:border-jungle-500 transition-colors"
          />
          <button
            type="button"
            onClick={addFromUrl}
            disabled={!urlInput.trim()}
            className="px-3 py-2 bg-jungle-700/60 hover:bg-jungle-600 disabled:opacity-40 text-white text-xs rounded-sm transition-colors inline-flex items-center gap-1"
          >
            <Plus size={12} /> Adicionar URL
          </button>
        </div>

        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          multiple
          initialSelected={images}
          onSelect={(urls) => commit(urls)}
          title="Escolher imagens da galeria"
        />
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
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldTextArea
          label="Descrição (PT)"
          value={String(content.description || "")}
          onChange={(v) => onUpdate("description", v)}
          rows={3}
        />
        <FieldTextArea
          label="Descrição (EN)"
          value={String(content.descriptionEn || "")}
          onChange={(v) => onUpdate("descriptionEn", v)}
          rows={3}
        />
      </div>
      <FieldBilingual
        label="Texto do Botão"
        valuePt={String(content.buttonText || "")}
        valueEn={String(content.buttonTextEn || "")}
        onChangePt={(v) => onUpdate("buttonText", v)}
        onChangeEn={(v) => onUpdate("buttonTextEn", v)}
      />
      <FieldInput
        label="Link do Botão"
        value={String(content.buttonLink || "")}
        onChange={(v) => onUpdate("buttonLink", v)}
      />
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
    titleEn?: string;
    text: string;
    textEn?: string;
    image: string;
  }[];

  const updateColumnCount = (newCount: number) => {
    const newItems = [...items];
    while (newItems.length < newCount) newItems.push({ title: "", titleEn: "", text: "", textEn: "", image: "" });
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
            <FieldBilingual
              label="Título"
              valuePt={item.title || ""}
              valueEn={item.titleEn || ""}
              onChangePt={(v) => updateItem(idx, "title", v)}
              onChangeEn={(v) => updateItem(idx, "titleEn", v)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldTextArea
                label="Texto (PT)"
                value={item.text || ""}
                onChange={(v) => updateItem(idx, "text", v)}
                rows={3}
              />
              <FieldTextArea
                label="Texto (EN)"
                value={item.textEn || ""}
                onChange={(v) => updateItem(idx, "textEn", v)}
                rows={3}
              />
            </div>
            <MediaField
              label="Imagem"
              value={item.image || ""}
              onChange={(v) => updateItem(idx, "image", v)}
              placeholder="URL ou escolher da biblioteca..."
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
    textEn?: string;
    rating: number;
  }[];

  const updateItem = (idx: number, key: string, val: unknown) => {
    const newItems = items.map((item, i) =>
      i === idx ? { ...item, [key]: val } : item
    );
    onUpdate("items", newItems);
  };

  const addItem = () =>
    onUpdate("items", [...items, { name: "", text: "", textEn: "", rating: 5 }]);

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    onUpdate("items", newItems.length ? newItems : [{ name: "", text: "", textEn: "", rating: 5 }]);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldTextArea
              label="Texto (PT)"
              value={item.text || ""}
              onChange={(v) => updateItem(idx, "text", v)}
              rows={3}
            />
            <FieldTextArea
              label="Texto (EN)"
              value={item.textEn || ""}
              onChange={(v) => updateItem(idx, "textEn", v)}
              rows={3}
            />
          </div>
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
  const autoNextEvent = content.autoNextEvent === true || content.autoNextEvent === "true";
  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3 p-3 bg-jungle-900/60 border border-jungle-700/30 rounded-sm cursor-pointer hover:bg-jungle-800/60 transition-colors">
        <input
          type="checkbox"
          checked={autoNextEvent}
          onChange={(e) => onUpdate("autoNextEvent", e.target.checked)}
          className="mt-0.5 accent-jungle-500"
        />
        <div>
          <p className="text-sm text-white font-medium">Escolher próximo evento automaticamente</p>
          <p className="text-xs text-gray-500 mt-0.5">
            O countdown conta para o próximo evento publicado. Se não houver evento futuro e não indicares uma data alvo manual, a secção fica oculta.
          </p>
        </div>
      </label>
      <FieldBilingual
        label={autoNextEvent ? "Título (opcional — sobrescreve o título do evento)" : "Título"}
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldTextArea
          label={autoNextEvent ? "Descrição PT (opcional — sobrescreve a data)" : "Descrição (PT)"}
          value={String(content.description || "")}
          onChange={(v) => onUpdate("description", v)}
          rows={3}
        />
        <FieldTextArea
          label="Descrição (EN)"
          value={String(content.descriptionEn || "")}
          onChange={(v) => onUpdate("descriptionEn", v)}
          rows={3}
        />
      </div>
      <FieldInput
        label={autoNextEvent ? "Data Alvo (fallback quando não há evento)" : "Data Alvo"}
        value={String(content.targetDate || "")}
        onChange={(v) => onUpdate("targetDate", v)}
        type="datetime-local"
      />
    </div>
  );
}

/* ---------- Bilingual helpers ---------- */

function FieldBilingual({
  label,
  valuePt,
  valueEn,
  onChangePt,
  onChangeEn,
  placeholder,
  placeholderEn,
}: {
  label: string;
  valuePt: string;
  valueEn: string;
  onChangePt: (v: string) => void;
  onChangeEn: (v: string) => void;
  placeholder?: string;
  placeholderEn?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
          {label} <span className="text-jungle-400">PT</span>
        </label>
        <input
          type="text"
          value={valuePt}
          onChange={(e) => onChangePt(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
          {label} <span className="text-jungle-400">EN</span>
        </label>
        <input
          type="text"
          value={valueEn}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={placeholderEn || placeholder}
          className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
        />
      </div>
    </div>
  );
}

function FieldCheckbox({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-3 bg-jungle-900/60 border border-jungle-700/30 rounded-sm cursor-pointer hover:bg-jungle-800/60 transition-colors">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 accent-jungle-500"
      />
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

/* ---------- Page Header ---------- */

function PageHeaderEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
        placeholder="Sobre o LIT"
      />
      <FieldBilingual
        label="Subtítulo"
        valuePt={String(content.subtitle || "")}
        valueEn={String(content.subtitleEn || "")}
        onChangePt={(v) => onUpdate("subtitle", v)}
        onChangeEn={(v) => onUpdate("subtitleEn", v)}
      />
      <FieldSelect
        label="Cor do divisor"
        value={String(content.accent || "neon-green")}
        onChange={(v) => onUpdate("accent", v)}
        options={[
          { value: "neon-green", label: "Verde Neon" },
          { value: "purple", label: "Roxo" },
          { value: "gold", label: "Dourado" },
        ]}
      />
    </div>
  );
}

/* ---------- Hero Home ---------- */

function HeroHomeEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Secção principal da homepage. Campos vazios caem para as Definições do Site.
      </p>
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
        placeholder="LIT"
      />
      <FieldBilingual
        label="Subtítulo"
        valuePt={String(content.subtitle || "")}
        valueEn={String(content.subtitleEn || "")}
        onChangePt={(v) => onUpdate("subtitle", v)}
        onChangeEn={(v) => onUpdate("subtitleEn", v)}
      />
      <MediaField
        label="Imagem (fallback quando não há vídeo)"
        value={String(content.heroImage || "")}
        onChange={(v) => onUpdate("heroImage", v)}
      />
      <FieldInput
        label="Vídeo (URL .mp4 ou similar)"
        value={String(content.heroVideo || "")}
        onChange={(v) => onUpdate("heroVideo", v)}
        placeholder="https://..."
      />
      <FieldCheckbox
        label="Mostrar botão de Reservas"
        value={content.showReservations !== false}
        onChange={(v) => onUpdate("showReservations", v)}
      />
    </div>
  );
}

/* ---------- Next Event Countdown ---------- */

function NextEventCountdownEditor({ content: _content, onUpdate: _onUpdate }: EditorProps) {
  return (
    <p className="text-gray-500 text-sm">
      Esta secção mostra automaticamente o próximo evento publicado. Não
      tem campos configuráveis — se não houver eventos futuros, não é renderizada.
    </p>
  );
}

/* ---------- Events Preview ---------- */

function EventsPreviewEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldSlider
        label="Número de eventos a mostrar"
        value={Number(content.limit) || 4}
        onChange={(v) => onUpdate("limit", v)}
        min={1}
        max={12}
        unit=""
      />
    </div>
  );
}

/* ---------- Events Grid ---------- */

function EventsGridEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Mostra todos os eventos publicados com filtros. Adiciona um título opcional.
      </p>
      <FieldBilingual
        label="Título (opcional)"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
    </div>
  );
}

/* ---------- Galleries Preview ---------- */

function GalleriesPreviewEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldSlider
        label="Número de galerias a mostrar"
        value={Number(content.limit) || 6}
        onChange={(v) => onUpdate("limit", v)}
        min={1}
        max={12}
        unit=""
      />
    </div>
  );
}

/* ---------- Galleries Grid ---------- */

function GalleriesGridEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Mostra todas as galerias publicadas. Adiciona um título opcional.
      </p>
      <FieldBilingual
        label="Título (opcional)"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
    </div>
  );
}

/* ---------- Contact CTA ---------- */

function ContactCtaEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Valores vazios caem para as Definições do Site.
      </p>
      <FieldInput
        label="Email (override)"
        value={String(content.email || "")}
        onChange={(v) => onUpdate("email", v)}
        placeholder="geral@litcoimbra.pt"
      />
      <FieldInput
        label="Instagram (override)"
        value={String(content.instagram || "")}
        onChange={(v) => onUpdate("instagram", v)}
        placeholder="https://instagram.com/..."
      />
      <FieldInput
        label="Facebook (override)"
        value={String(content.facebook || "")}
        onChange={(v) => onUpdate("facebook", v)}
        placeholder="https://facebook.com/..."
      />
    </div>
  );
}

/* ---------- Contact Info ---------- */

function ContactInfoEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
        placeholder="Fala connosco"
      />
      <FieldBilingual
        label="Introdução"
        valuePt={String(content.intro || "")}
        valueEn={String(content.introEn || "")}
        onChangePt={(v) => onUpdate("intro", v)}
        onChangeEn={(v) => onUpdate("introEn", v)}
      />
      <div className="grid grid-cols-2 gap-3">
        <FieldCheckbox
          label="Mostrar Email"
          value={content.showEmail !== false}
          onChange={(v) => onUpdate("showEmail", v)}
        />
        <FieldCheckbox
          label="Mostrar Telefone"
          value={content.showPhone !== false}
          onChange={(v) => onUpdate("showPhone", v)}
        />
        <FieldCheckbox
          label="Mostrar Morada"
          value={content.showAddress !== false}
          onChange={(v) => onUpdate("showAddress", v)}
        />
        <FieldCheckbox
          label="Mostrar Redes Sociais"
          value={content.showSocials !== false}
          onChange={(v) => onUpdate("showSocials", v)}
        />
      </div>
    </div>
  );
}

/* ---------- Contact Form ---------- */

function ContactFormEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título (opcional)"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
    </div>
  );
}

/* ---------- Contact Map ---------- */

function ContactMapEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título (opcional)"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <p className="text-xs text-gray-500">
        Valores vazios caem para as coordenadas nas Definições do Site.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput
          label="Latitude (override)"
          value={String(content.lat || "")}
          onChange={(v) => onUpdate("lat", v)}
          placeholder="40.2085"
        />
        <FieldInput
          label="Longitude (override)"
          value={String(content.lng || "")}
          onChange={(v) => onUpdate("lng", v)}
          placeholder="-8.4261"
        />
      </div>
      <FieldSlider
        label="Zoom"
        value={Number(content.zoom) || 16}
        onChange={(v) => onUpdate("zoom", v)}
        min={10}
        max={20}
        unit=""
      />
    </div>
  );
}

/* ---------- Reservation Form ---------- */

function ReservationFormEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-4">
      <FieldCheckbox
        label="Mostrar cabeçalho interno do formulário"
        description="Desativa o título VIP pré-desenhado para usar o teu próprio cabeçalho acima."
        value={content.showHeader !== false}
        onChange={(v) => onUpdate("showHeader", v)}
      />
      {content.showHeader !== false && (
        <>
          <FieldBilingual
            label="Título (override do cabeçalho)"
            valuePt={String(content.title || "")}
            valueEn={String(content.titleEn || "")}
            onChangePt={(v) => onUpdate("title", v)}
            onChangeEn={(v) => onUpdate("titleEn", v)}
          />
          <FieldBilingual
            label="Subtítulo (override)"
            valuePt={String(content.subtitle || "")}
            valueEn={String(content.subtitleEn || "")}
            onChangePt={(v) => onUpdate("subtitle", v)}
            onChangeEn={(v) => onUpdate("subtitleEn", v)}
          />
        </>
      )}
      <FieldCheckbox
        label="Mostrar seletor de Eventos"
        description="Permite ao cliente associar a reserva a um evento publicado."
        value={content.showEventSelector !== false}
        onChange={(v) => onUpdate("showEventSelector", v)}
      />
    </div>
  );
}

/* ---------- Info Cards ---------- */

function InfoCardsEditor({ content, onUpdate }: EditorProps) {
  const items = (Array.isArray(content.items) ? content.items : []) as Array<{
    icon?: string;
    title?: string;
    titleEn?: string;
    text?: string;
    textEn?: string;
    link?: string;
  }>;

  const updateItem = (idx: number, key: string, val: string) => {
    const newItems = items.map((item, i) =>
      i === idx ? { ...item, [key]: val } : item
    );
    onUpdate("items", newItems);
  };

  const addItem = () =>
    onUpdate("items", [
      ...items,
      { icon: "mapPin", title: "", titleEn: "", text: "", textEn: "", link: "" },
    ]);

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    onUpdate("items", newItems.length ? newItems : [
      { icon: "mapPin", title: "", titleEn: "", text: "", textEn: "", link: "" },
    ]);
  };

  const iconOptions = [
    { value: "mapPin", label: "Localização" },
    { value: "clock", label: "Relógio" },
    { value: "mail", label: "Email" },
    { value: "phone", label: "Telefone" },
    { value: "calendar", label: "Calendário" },
    { value: "crown", label: "Coroa" },
    { value: "arrow", label: "Seta" },
  ];

  const iconPreview: Record<string, React.ReactNode> = {
    mapPin: <MapPin size={14} />,
    clock: <Clock size={14} />,
    mail: <Mail size={14} />,
    phone: <Phone size={14} />,
    calendar: <Calendar size={14} />,
    crown: <Crown size={14} />,
    arrow: <ArrowRight size={14} />,
  };

  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título (opcional)"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <FieldSelect
        label="Colunas"
        value={String(content.columns || 2)}
        onChange={(v) => onUpdate("columns", Number(v))}
        options={[
          { value: "1", label: "1 Coluna" },
          { value: "2", label: "2 Colunas" },
          { value: "3", label: "3 Colunas" },
          { value: "4", label: "4 Colunas" },
        ]}
      />
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-jungle-900/80 border border-jungle-700/20 rounded-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                {iconPreview[item.icon || "mapPin"]} Cartão {idx + 1}
              </p>
              <button
                onClick={() => removeItem(idx)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <FieldSelect
              label="Ícone"
              value={String(item.icon || "mapPin")}
              onChange={(v) => updateItem(idx, "icon", v)}
              options={iconOptions}
            />
            <FieldBilingual
              label="Título"
              valuePt={item.title || ""}
              valueEn={item.titleEn || ""}
              onChangePt={(v) => updateItem(idx, "title", v)}
              onChangeEn={(v) => updateItem(idx, "titleEn", v)}
            />
            <FieldBilingual
              label="Texto"
              valuePt={item.text || ""}
              valueEn={item.textEn || ""}
              onChangePt={(v) => updateItem(idx, "text", v)}
              onChangeEn={(v) => updateItem(idx, "textEn", v)}
            />
            <FieldInput
              label="Link (opcional)"
              value={item.link || ""}
              onChange={(v) => updateItem(idx, "link", v)}
              placeholder="/eventos"
            />
          </div>
        ))}
      </div>
      <button
        onClick={addItem}
        className="text-sm text-jungle-400 hover:text-jungle-300 flex items-center gap-1"
      >
        <Plus size={14} /> Adicionar cartão
      </button>
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

/* ================================================================== */
/* Advanced Editor (animation, responsive, anchor, custom class)       */
/* ================================================================== */

const ANIMATION_OPTIONS = [
  { value: "none", label: "Nenhuma" },
  { value: "fadeIn", label: "Fade In" },
  { value: "slideUp", label: "Slide Up" },
  { value: "slideDown", label: "Slide Down" },
  { value: "slideLeft", label: "Slide Left" },
  { value: "slideRight", label: "Slide Right" },
  { value: "zoomIn", label: "Zoom In" },
];

const BREAKPOINTS: Array<{ key: "mobile" | "tablet" | "desktop"; label: string }> = [
  { key: "mobile", label: "Telemóvel" },
  { key: "tablet", label: "Tablet" },
  { key: "desktop", label: "Desktop" },
];

function AdvancedEditor({
  spacing,
  onUpdate,
}: {
  spacing: SpacingData;
  onUpdate: (key: keyof SpacingData, value: unknown) => void;
}) {
  const hideOn = spacing.hideOn || [];
  const toggleHide = (bp: "mobile" | "tablet" | "desktop") => {
    const set = new Set(hideOn);
    if (set.has(bp)) set.delete(bp);
    else set.add(bp);
    onUpdate("hideOn", Array.from(set));
  };

  return (
    <div className="bg-jungle-900/40 border border-jungle-700/30 rounded-sm p-4 space-y-5">
      {/* Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldSelect
          label="Animação ao aparecer"
          value={spacing.animation || "none"}
          onChange={(v) => onUpdate("animation", v)}
          options={ANIMATION_OPTIONS}
        />
        <FieldSlider
          label="Atraso da animação"
          value={spacing.animationDelay || 0}
          onChange={(v) => onUpdate("animationDelay", v)}
          min={0}
          max={2000}
          unit="ms"
        />
      </div>

      {/* Responsive visibility */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Esconder em</label>
        <div className="flex flex-wrap gap-2">
          {BREAKPOINTS.map((bp) => {
            const active = hideOn.includes(bp.key);
            return (
              <button
                key={bp.key}
                type="button"
                onClick={() => toggleHide(bp.key)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-sm border transition-colors",
                  active
                    ? "bg-jungle-700/60 border-jungle-500 text-white"
                    : "bg-jungle-900 border-jungle-700/40 text-gray-400 hover:text-white hover:border-jungle-600"
                )}
              >
                {bp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Background overlay & video */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Sobreposição (cor)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={(spacing.bgOverlay || "#000000").slice(0, 7)}
              onChange={(e) => onUpdate("bgOverlay", e.target.value)}
              className="w-10 h-10 rounded-sm border border-jungle-700/50 bg-jungle-900 cursor-pointer"
            />
            <input
              type="text"
              value={spacing.bgOverlay || ""}
              onChange={(e) => onUpdate("bgOverlay", e.target.value)}
              placeholder="rgba(0,0,0,0.5)"
              className="flex-1 px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
            />
            {spacing.bgOverlay && (
              <button onClick={() => onUpdate("bgOverlay", "")} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Use rgba para transparência por cima da imagem ou vídeo de fundo.</p>
        </div>
        <FieldInput
          label="Vídeo de Fundo (URL .mp4 / .webm)"
          value={spacing.bgVideo || ""}
          onChange={(v) => onUpdate("bgVideo", v)}
          placeholder="https://..."
        />
      </div>

      {/* Anchor + custom class */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldInput
          label="ID âncora"
          value={spacing.anchorId || ""}
          onChange={(v) => onUpdate("anchorId", v.trim())}
          placeholder="reservas, contacto, faq..."
        />
        <FieldInput
          label="Classes CSS extra"
          value={spacing.customClass || ""}
          onChange={(v) => onUpdate("customClass", v)}
          placeholder="my-custom-class outra-classe"
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/* Heading Editor                                                      */
/* ================================================================== */

function HeadingEditor({ content, onUpdate }: EditorProps) {
  return (
    <div className="space-y-3">
      <FieldBilingual
        label="Texto"
        valuePt={String(content.text || "")}
        valueEn={String(content.textEn || "")}
        onChangePt={(v) => onUpdate("text", v)}
        onChangeEn={(v) => onUpdate("textEn", v)}
        placeholder="O título"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FieldSelect
          label="Tag"
          value={String(content.level || "h2")}
          onChange={(v) => onUpdate("level", v)}
          options={[
            { value: "h1", label: "H1" },
            { value: "h2", label: "H2" },
            { value: "h3", label: "H3" },
            { value: "h4", label: "H4" },
          ]}
        />
        <FieldSelect
          label="Tamanho"
          value={String(content.size || "lg")}
          onChange={(v) => onUpdate("size", v)}
          options={[
            { value: "sm", label: "Pequeno" },
            { value: "md", label: "Médio" },
            { value: "lg", label: "Grande" },
            { value: "xl", label: "Extra" },
          ]}
        />
        <FieldSelect
          label="Alinhamento"
          value={String(content.align || "left")}
          onChange={(v) => onUpdate("align", v)}
          options={[
            { value: "left", label: "Esquerda" },
            { value: "center", label: "Centro" },
            { value: "right", label: "Direita" },
          ]}
        />
        <FieldCheckbox
          label="Linha decorativa"
          value={content.decoration === true}
          onChange={(v) => onUpdate("decoration", v)}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/* Icon picker (shared by IconBox / future widgets)                    */
/* ================================================================== */

const ICON_CHOICES: Array<{ key: string; label: string; node: React.ReactNode }> = [
  { key: "mapPin", label: "Localização", node: <MapPin size={18} /> },
  { key: "clock", label: "Relógio", node: <Clock size={18} /> },
  { key: "mail", label: "Email", node: <Mail size={18} /> },
  { key: "phone", label: "Telefone", node: <Phone size={18} /> },
  { key: "calendar", label: "Calendário", node: <Calendar size={18} /> },
  { key: "crown", label: "Coroa", node: <Crown size={18} /> },
  { key: "arrow", label: "Seta", node: <ArrowRight size={18} /> },
  { key: "star", label: "Estrela", node: <Star size={18} /> },
  { key: "heart", label: "Coração", node: <Heart size={18} /> },
  { key: "award", label: "Prémio", node: <Award size={18} /> },
  { key: "gift", label: "Oferta", node: <Gift size={18} /> },
  { key: "music", label: "Música", node: <Music size={18} /> },
  { key: "sparkles", label: "Sparkles", node: <Sparkles size={18} /> },
  { key: "zap", label: "Raio", node: <Zap size={18} /> },
  { key: "shield", label: "Escudo", node: <Shield size={18} /> },
  { key: "wine", label: "Vinho", node: <Wine size={18} /> },
  { key: "glass", label: "Copo", node: <GlassWater size={18} /> },
  { key: "users", label: "Pessoas", node: <Users size={18} /> },
  { key: "instagram", label: "Instagram", node: <InstagramIcon size={18} /> },
  { key: "facebook", label: "Facebook", node: <FacebookIcon size={18} /> },
];

function IconPicker({
  value,
  onChange,
  label = "Ícone",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = ICON_CHOICES.find((c) => c.key === value) || ICON_CHOICES[12]; // sparkles

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm hover:border-jungle-500 transition-colors"
      >
        <span className="flex items-center gap-2 text-jungle-300">
          {current.node}
          <span className="text-white">{current.label}</span>
        </span>
        <ChevronDown
          size={14}
          className={cn("text-gray-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-2 p-2 bg-jungle-950 border border-jungle-700/50 rounded-sm">
          <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto">
            {ICON_CHOICES.map((choice) => {
              const isActive = choice.key === current.key;
              return (
                <button
                  key={choice.key}
                  type="button"
                  onClick={() => {
                    onChange(choice.key);
                    setOpen(false);
                  }}
                  title={choice.label}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-sm border transition-colors",
                    isActive
                      ? "bg-jungle-700 border-jungle-400 text-white"
                      : "bg-jungle-900 border-jungle-800 text-gray-400 hover:bg-jungle-800 hover:text-white hover:border-jungle-600"
                  )}
                >
                  {choice.node}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* Icon Box Editor                                                     */
/* ================================================================== */

type IconBoxItem = {
  icon?: string;
  title?: string;
  titleEn?: string;
  text?: string;
  textEn?: string;
};

function IconBoxEditor({ content, onUpdate }: EditorProps) {
  const items: IconBoxItem[] = Array.isArray(content.items) ? (content.items as IconBoxItem[]) : [];
  const setItems = (next: IconBoxItem[]) => onUpdate("items", next);

  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título da secção"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <FieldBilingual
        label="Intro"
        valuePt={String(content.intro || "")}
        valueEn={String(content.introEn || "")}
        onChangePt={(v) => onUpdate("intro", v)}
        onChangeEn={(v) => onUpdate("introEn", v)}
      />
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect
          label="Colunas"
          value={String(content.columns || 3)}
          onChange={(v) => onUpdate("columns", Number(v))}
          options={[
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
          ]}
        />
        <FieldSelect
          label="Layout"
          value={String(content.layout || "centered")}
          onChange={(v) => onUpdate("layout", v)}
          options={[
            { value: "centered", label: "Centrado" },
            { value: "left", label: "Alinhado à esquerda" },
          ]}
        />
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="p-3 bg-jungle-900/40 border border-jungle-700/30 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-jungle-400">Item #{i + 1}</span>
              <button
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="text-gray-500 hover:text-red-400 transition-colors"
                title="Remover"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <IconPicker
              value={item.icon || "sparkles"}
              onChange={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, icon: v } : it)))}
            />
            <FieldBilingual
              label="Título"
              valuePt={item.title || ""}
              valueEn={item.titleEn || ""}
              onChangePt={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, title: v } : it)))}
              onChangeEn={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, titleEn: v } : it)))}
            />
            <FieldBilingual
              label="Texto"
              valuePt={item.text || ""}
              valueEn={item.textEn || ""}
              onChangePt={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, text: v } : it)))}
              onChangeEn={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, textEn: v } : it)))}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setItems([
              ...items,
              { icon: "sparkles", title: "", titleEn: "", text: "", textEn: "" },
            ])
          }
          className="w-full py-2 border border-dashed border-jungle-700/50 rounded-sm text-sm text-gray-400 hover:text-white hover:border-jungle-500/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Adicionar item
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Accordion Editor                                                    */
/* ================================================================== */

type AccordionItem = {
  question?: string;
  questionEn?: string;
  answer?: string;
  answerEn?: string;
};

function AccordionEditor({ content, onUpdate }: EditorProps) {
  const items: AccordionItem[] = Array.isArray(content.items) ? (content.items as AccordionItem[]) : [];
  const setItems = (next: AccordionItem[]) => onUpdate("items", next);

  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
        placeholder="Perguntas frequentes"
      />
      <FieldBilingual
        label="Intro"
        valuePt={String(content.intro || "")}
        valueEn={String(content.introEn || "")}
        onChangePt={(v) => onUpdate("intro", v)}
        onChangeEn={(v) => onUpdate("introEn", v)}
      />

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="p-3 bg-jungle-900/40 border border-jungle-700/30 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-jungle-400">Item #{i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (i === 0) return;
                    const next = [...items];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    setItems(next);
                  }}
                  disabled={i === 0}
                  className="text-gray-500 hover:text-white disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => {
                    if (i === items.length - 1) return;
                    const next = [...items];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    setItems(next);
                  }}
                  disabled={i === items.length - 1}
                  className="text-gray-500 hover:text-white disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <FieldBilingual
              label="Pergunta"
              valuePt={item.question || ""}
              valueEn={item.questionEn || ""}
              onChangePt={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, question: v } : it)))}
              onChangeEn={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, questionEn: v } : it)))}
            />
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Resposta (PT) — HTML permitido</label>
              <RichTextEditor
                value={item.answer || ""}
                onChange={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, answer: v } : it)))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Resposta (EN)</label>
              <RichTextEditor
                value={item.answerEn || ""}
                onChange={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, answerEn: v } : it)))}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems([...items, { question: "", questionEn: "", answer: "", answerEn: "" }])}
          className="w-full py-2 border border-dashed border-jungle-700/50 rounded-sm text-sm text-gray-400 hover:text-white hover:border-jungle-500/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Adicionar pergunta
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Stats Editor                                                        */
/* ================================================================== */

type StatItem = {
  value?: number;
  label?: string;
  labelEn?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
};

function StatsEditor({ content, onUpdate }: EditorProps) {
  const items: StatItem[] = Array.isArray(content.items) ? (content.items as StatItem[]) : [];
  const setItems = (next: StatItem[]) => onUpdate("items", next);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="p-3 bg-jungle-900/40 border border-jungle-700/30 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-jungle-400">Stat #{i + 1}</span>
            <button
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="text-gray-500 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FieldInput
              label="Prefixo"
              value={item.prefix || ""}
              onChange={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, prefix: v } : it)))}
              placeholder="€, $..."
            />
            <FieldInput
              label="Valor"
              type="number"
              value={String(item.value ?? 0)}
              onChange={(v) =>
                setItems(items.map((it, idx) => (idx === i ? { ...it, value: Number(v) } : it)))
              }
            />
            <FieldInput
              label="Sufixo"
              value={item.suffix || ""}
              onChange={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, suffix: v } : it)))}
              placeholder="+, k, %..."
            />
            <FieldInput
              label="Duração (ms)"
              type="number"
              value={String(item.duration ?? 1500)}
              onChange={(v) =>
                setItems(items.map((it, idx) => (idx === i ? { ...it, duration: Number(v) } : it)))
              }
            />
          </div>
          <FieldBilingual
            label="Etiqueta"
            valuePt={item.label || ""}
            valueEn={item.labelEn || ""}
            onChangePt={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, label: v } : it)))}
            onChangeEn={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, labelEn: v } : it)))}
            placeholder="Eventos realizados"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setItems([
            ...items,
            { value: 0, label: "", labelEn: "", prefix: "", suffix: "", duration: 1500 },
          ])
        }
        className="w-full py-2 border border-dashed border-jungle-700/50 rounded-sm text-sm text-gray-400 hover:text-white hover:border-jungle-500/50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Adicionar estatística
      </button>
    </div>
  );
}

/* ================================================================== */
/* Tabs Editor                                                         */
/* ================================================================== */

type TabItem = {
  label?: string;
  labelEn?: string;
  body?: string;
  bodyEn?: string;
};

function TabsEditor({ content, onUpdate }: EditorProps) {
  const items: TabItem[] = Array.isArray(content.items) ? (content.items as TabItem[]) : [];
  const setItems = (next: TabItem[]) => onUpdate("items", next);

  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <FieldBilingual
        label="Intro"
        valuePt={String(content.intro || "")}
        valueEn={String(content.introEn || "")}
        onChangePt={(v) => onUpdate("intro", v)}
        onChangeEn={(v) => onUpdate("introEn", v)}
      />
      <FieldSelect
        label="Layout"
        value={String(content.layout || "horizontal")}
        onChange={(v) => onUpdate("layout", v)}
        options={[
          { value: "horizontal", label: "Horizontal (separadores no topo)" },
          { value: "vertical", label: "Vertical (separadores à esquerda)" },
        ]}
      />

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="p-3 bg-jungle-900/40 border border-jungle-700/30 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-jungle-400">Tab #{i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (i === 0) return;
                    const next = [...items];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    setItems(next);
                  }}
                  disabled={i === 0}
                  className="text-gray-500 hover:text-white disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => {
                    if (i === items.length - 1) return;
                    const next = [...items];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    setItems(next);
                  }}
                  disabled={i === items.length - 1}
                  className="text-gray-500 hover:text-white disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <FieldBilingual
              label="Etiqueta"
              valuePt={item.label || ""}
              valueEn={item.labelEn || ""}
              onChangePt={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, label: v } : it)))}
              onChangeEn={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, labelEn: v } : it)))}
            />
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Conteúdo (PT)</label>
              <RichTextEditor
                value={item.body || ""}
                onChange={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, body: v } : it)))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Conteúdo (EN)</label>
              <RichTextEditor
                value={item.bodyEn || ""}
                onChange={(v) => setItems(items.map((it, idx) => (idx === i ? { ...it, bodyEn: v } : it)))}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setItems([...items, { label: `Tab ${items.length + 1}`, labelEn: `Tab ${items.length + 1}`, body: "", bodyEn: "" }])
          }
          className="w-full py-2 border border-dashed border-jungle-700/50 rounded-sm text-sm text-gray-400 hover:text-white hover:border-jungle-500/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Adicionar separador
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Pricing Editor                                                      */
/* ================================================================== */

type PricingItem = {
  name?: string;
  nameEn?: string;
  price?: string;
  priceLabel?: string;
  priceLabelEn?: string;
  description?: string;
  descriptionEn?: string;
  features?: string[];
  featuresEn?: string[];
  ctaText?: string;
  ctaTextEn?: string;
  ctaLink?: string;
  highlight?: boolean;
  badge?: string;
  badgeEn?: string;
};

function PricingEditor({ content, onUpdate }: EditorProps) {
  const items: PricingItem[] = Array.isArray(content.items) ? (content.items as PricingItem[]) : [];
  const setItems = (next: PricingItem[]) => onUpdate("items", next);

  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
      />
      <FieldBilingual
        label="Intro"
        valuePt={String(content.intro || "")}
        valueEn={String(content.introEn || "")}
        onChangePt={(v) => onUpdate("intro", v)}
        onChangeEn={(v) => onUpdate("introEn", v)}
      />
      <FieldSelect
        label="Colunas"
        value={String(content.columns || 3)}
        onChange={(v) => onUpdate("columns", Number(v))}
        options={[
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ]}
      />

      <div className="space-y-3">
        {items.map((plan, i) => {
          const features = plan.features || [];
          const featuresEn = plan.featuresEn || [];
          const updatePlan = (patch: Partial<PricingItem>) =>
            setItems(items.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

          return (
            <div key={i} className="p-3 bg-jungle-900/40 border border-jungle-700/30 rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-jungle-400">Plano #{i + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (i === 0) return;
                      const next = [...items];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      setItems(next);
                    }}
                    disabled={i === 0}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (i === items.length - 1) return;
                      const next = [...items];
                      [next[i + 1], next[i]] = [next[i], next[i + 1]];
                      setItems(next);
                    }}
                    disabled={i === items.length - 1}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <FieldBilingual
                label="Nome do plano"
                valuePt={plan.name || ""}
                valueEn={plan.nameEn || ""}
                onChangePt={(v) => updatePlan({ name: v })}
                onChangeEn={(v) => updatePlan({ nameEn: v })}
              />

              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="Preço"
                  value={plan.price || ""}
                  onChange={(v) => updatePlan({ price: v })}
                  placeholder="€150"
                />
                <FieldBilingual
                  label="Etiqueta do preço"
                  valuePt={plan.priceLabel || ""}
                  valueEn={plan.priceLabelEn || ""}
                  onChangePt={(v) => updatePlan({ priceLabel: v })}
                  onChangeEn={(v) => updatePlan({ priceLabelEn: v })}
                  placeholder="/ mesa"
                />
              </div>

              <FieldBilingual
                label="Descrição curta"
                valuePt={plan.description || ""}
                valueEn={plan.descriptionEn || ""}
                onChangePt={(v) => updatePlan({ description: v })}
                onChangeEn={(v) => updatePlan({ descriptionEn: v })}
              />

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Funcionalidades (PT, uma por linha)</label>
                <textarea
                  value={features.join("\n")}
                  onChange={(e) => updatePlan({ features: e.target.value.split("\n") })}
                  rows={4}
                  className="w-full px-3 py-2 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
                  placeholder="Mesa para 4 pessoas&#10;Garrafa de boas-vindas"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Funcionalidades (EN, uma por linha)</label>
                <textarea
                  value={featuresEn.join("\n")}
                  onChange={(e) => updatePlan({ featuresEn: e.target.value.split("\n") })}
                  rows={4}
                  className="w-full px-3 py-2 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FieldBilingual
                  label="Texto do CTA"
                  valuePt={plan.ctaText || ""}
                  valueEn={plan.ctaTextEn || ""}
                  onChangePt={(v) => updatePlan({ ctaText: v })}
                  onChangeEn={(v) => updatePlan({ ctaTextEn: v })}
                />
                <FieldInput
                  label="Link do CTA"
                  value={plan.ctaLink || ""}
                  onChange={(v) => updatePlan({ ctaLink: v })}
                  placeholder="/reservas"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FieldBilingual
                  label="Badge (opcional)"
                  valuePt={plan.badge || ""}
                  valueEn={plan.badgeEn || ""}
                  onChangePt={(v) => updatePlan({ badge: v })}
                  onChangeEn={(v) => updatePlan({ badgeEn: v })}
                  placeholder="Popular"
                />
                <FieldCheckbox
                  label="Plano em destaque"
                  value={plan.highlight === true}
                  onChange={(v) => updatePlan({ highlight: v })}
                />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() =>
            setItems([
              ...items,
              {
                name: "",
                nameEn: "",
                price: "€0",
                priceLabel: "",
                priceLabelEn: "",
                description: "",
                descriptionEn: "",
                features: [],
                featuresEn: [],
                ctaText: "Reservar",
                ctaTextEn: "Book",
                ctaLink: "/reservas",
                highlight: false,
                badge: "",
                badgeEn: "",
              },
            ])
          }
          className="w-full py-2 border border-dashed border-jungle-700/50 rounded-sm text-sm text-gray-400 hover:text-white hover:border-jungle-500/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Adicionar plano
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Button Group Editor                                                 */
/* ================================================================== */

type ButtonGroupItem = {
  label?: string;
  labelEn?: string;
  link?: string;
  style?: "primary" | "secondary" | "ghost";
  icon?: string;
};

function ButtonGroupEditor({ content, onUpdate }: EditorProps) {
  const buttons: ButtonGroupItem[] = Array.isArray(content.buttons) ? (content.buttons as ButtonGroupItem[]) : [];
  const setButtons = (next: ButtonGroupItem[]) => onUpdate("buttons", next);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect
          label="Alinhamento"
          value={String(content.align || "center")}
          onChange={(v) => onUpdate("align", v)}
          options={[
            { value: "left", label: "Esquerda" },
            { value: "center", label: "Centro" },
            { value: "right", label: "Direita" },
          ]}
        />
        <FieldSelect
          label="Layout"
          value={String(content.layout || "row")}
          onChange={(v) => onUpdate("layout", v)}
          options={[
            { value: "row", label: "Linha (lado a lado)" },
            { value: "column", label: "Coluna (empilhados)" },
          ]}
        />
      </div>

      <div className="space-y-3">
        {buttons.map((btn, i) => {
          const updateBtn = (patch: Partial<ButtonGroupItem>) =>
            setButtons(buttons.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
          return (
            <div key={i} className="p-3 bg-jungle-900/40 border border-jungle-700/30 rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-jungle-400">Botão #{i + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (i === 0) return;
                      const next = [...buttons];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      setButtons(next);
                    }}
                    disabled={i === 0}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (i === buttons.length - 1) return;
                      const next = [...buttons];
                      [next[i + 1], next[i]] = [next[i], next[i + 1]];
                      setButtons(next);
                    }}
                    disabled={i === buttons.length - 1}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => setButtons(buttons.filter((_, idx) => idx !== i))}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <FieldBilingual
                label="Etiqueta"
                valuePt={btn.label || ""}
                valueEn={btn.labelEn || ""}
                onChangePt={(v) => updateBtn({ label: v })}
                onChangeEn={(v) => updateBtn({ labelEn: v })}
              />
              <FieldInput
                label="Link"
                value={btn.link || ""}
                onChange={(v) => updateBtn({ link: v })}
                placeholder="/reservas ou https://..."
              />
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Estilo"
                  value={String(btn.style || "primary")}
                  onChange={(v) => updateBtn({ style: v as ButtonGroupItem["style"] })}
                  options={[
                    { value: "primary", label: "Primário" },
                    { value: "secondary", label: "Secundário" },
                    { value: "ghost", label: "Ghost" },
                  ]}
                />
                <IconPicker
                  label="Ícone (opcional)"
                  value={btn.icon || ""}
                  onChange={(v) => updateBtn({ icon: v })}
                />
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() =>
            setButtons([
              ...buttons,
              { label: "Botão", labelEn: "Button", link: "#", style: "primary", icon: "" },
            ])
          }
          className="w-full py-2 border border-dashed border-jungle-700/50 rounded-sm text-sm text-gray-400 hover:text-white hover:border-jungle-500/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Adicionar botão
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Logos Editor                                                        */
/* ================================================================== */

type LogoItem = { src?: string; alt?: string; href?: string };

function LogosEditor({ content, onUpdate }: EditorProps) {
  const items: LogoItem[] = Array.isArray(content.items) ? (content.items as LogoItem[]) : [];
  const setItems = (next: LogoItem[]) => onUpdate("items", next);

  return (
    <div className="space-y-4">
      <FieldBilingual
        label="Título / Etiqueta superior"
        valuePt={String(content.title || "")}
        valueEn={String(content.titleEn || "")}
        onChangePt={(v) => onUpdate("title", v)}
        onChangeEn={(v) => onUpdate("titleEn", v)}
        placeholder="Os nossos parceiros"
      />
      <div className="grid grid-cols-2 gap-3">
        <FieldSelect
          label="Colunas"
          value={String(content.columns || 5)}
          onChange={(v) => onUpdate("columns", Number(v))}
          options={[
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" },
            { value: "6", label: "6" },
          ]}
        />
        <FieldCheckbox
          label="Logos a preto-e-branco (cor no hover)"
          value={content.grayscale !== false}
          onChange={(v) => onUpdate("grayscale", v)}
        />
      </div>

      <div className="space-y-3">
        {items.map((logo, i) => {
          const updateLogo = (patch: Partial<LogoItem>) =>
            setItems(items.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
          return (
            <div key={i} className="p-3 bg-jungle-900/40 border border-jungle-700/30 rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-jungle-400">Logo #{i + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (i === 0) return;
                      const next = [...items];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      setItems(next);
                    }}
                    disabled={i === 0}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (i === items.length - 1) return;
                      const next = [...items];
                      [next[i + 1], next[i]] = [next[i], next[i + 1]];
                      setItems(next);
                    }}
                    disabled={i === items.length - 1}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <MediaField
                label="Imagem do logo"
                value={logo.src || ""}
                onChange={(v) => updateLogo({ src: v })}
                placeholder="URL ou escolher da biblioteca..."
              />
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="Texto alternativo"
                  value={logo.alt || ""}
                  onChange={(v) => updateLogo({ alt: v })}
                  placeholder="Nome do parceiro"
                />
                <FieldInput
                  label="Link (opcional)"
                  value={logo.href || ""}
                  onChange={(v) => updateLogo({ href: v })}
                  placeholder="https://..."
                />
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setItems([...items, { src: "", alt: "", href: "" }])}
          className="w-full py-2 border border-dashed border-jungle-700/50 rounded-sm text-sm text-gray-400 hover:text-white hover:border-jungle-500/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Adicionar logo
        </button>
      </div>
    </div>
  );
}
