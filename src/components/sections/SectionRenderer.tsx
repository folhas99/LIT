import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/ui/Countdown";
import Reveal, { type RevealAnimation } from "@/components/ui/Reveal";
import { prisma } from "@/lib/prisma";
import { getSettings, pickLocalized } from "@/lib/settings";
import { getServerLocale } from "@/lib/server-locale";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Calendar,
  Crown,
  Star,
  Heart,
  Award,
  Gift,
  Music,
  Sparkles,
  Zap,
  Shield,
  Wine,
  GlassWater,
  Users,
} from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";

import Hero from "@/components/home/Hero";
import NextEventCountdown from "@/components/home/NextEventCountdown";
import EventsPreview from "@/components/home/EventsPreview";
import GalleryPreview from "@/components/home/GalleryPreview";
import ContactCTA from "@/components/home/ContactCTA";
import EventsFilterView from "@/components/events/EventsFilterView";
import GalleriesFilterView from "@/components/gallery/GalleriesFilterView";
import ContactForm from "@/app/contacto/ContactForm";
import ContactMap from "@/components/ContactMap";
import ReservationForm from "@/components/forms/ReservationForm";
import AccordionSection from "@/components/sections/client/AccordionSection";
import StatsSection from "@/components/sections/client/StatsSection";
import TabsSection from "@/components/sections/client/TabsSection";

type SpacingConfig = {
  marginTop?: number;
  marginBottom?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  maxWidth?: string;
  bgColor?: string;
  bgGradient?: string;
  bgImage?: string;
  borderRadius?: number;
  /** When true, the section escapes the standard max-width wrapper (used for hero / full-bleed). */
  fullBleed?: boolean;
  /** Colour with optional alpha layered above the background image / video. */
  bgOverlay?: string;
  /** Background video URL (mp4/webm). Plays muted & looped behind the content. */
  bgVideo?: string;
  /** Entry animation when the section scrolls into view. */
  animation?: RevealAnimation | "none";
  /** Delay before the entry animation starts, in ms. */
  animationDelay?: number;
  /** Hide the section on the listed breakpoints. */
  hideOn?: Array<"mobile" | "tablet" | "desktop">;
  /** HTML id on the `<section>` element for in-page anchor links. */
  anchorId?: string;
  /** Extra CSS class names appended to the section root. */
  customClass?: string;
};

type Section = {
  id: string;
  page: string;
  type: string;
  content: string;
  order: number;
  visible: boolean;
  spacing: string | null;
};

type Locale = "pt" | "en";

function parseJSON(str: string | null, fallback: Record<string, unknown> = {}) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/** Pick the localized value from a section's content JSON. Falls back to the PT key. */
function pickContent(
  content: Record<string, unknown>,
  key: string,
  locale: Locale
): string {
  const base = (content[key] as string) || "";
  if (locale === "en") {
    const en = (content[`${key}En`] as string) || "";
    return en.trim() || base;
  }
  return base;
}

function getSpacingStyle(spacing: SpacingConfig) {
  // bgImage is applied separately as a positioned layer so we can stack an
  // overlay on top without compositing issues. Solid colour and gradients
  // remain on the wrapper so they affect borders/border-radius cleanly.
  return {
    marginTop: spacing.marginTop ? `${spacing.marginTop}px` : undefined,
    marginBottom: spacing.marginBottom ? `${spacing.marginBottom}px` : undefined,
    paddingTop: spacing.paddingTop ? `${spacing.paddingTop}px` : undefined,
    paddingRight: spacing.paddingRight ? `${spacing.paddingRight}px` : undefined,
    paddingBottom: spacing.paddingBottom ? `${spacing.paddingBottom}px` : undefined,
    paddingLeft: spacing.paddingLeft ? `${spacing.paddingLeft}px` : undefined,
    backgroundColor: spacing.bgColor || undefined,
    background: spacing.bgGradient || undefined,
    borderRadius: spacing.borderRadius ? `${spacing.borderRadius}px` : undefined,
  };
}

/** Tailwind classes that hide a section on selected breakpoints. */
function getResponsiveHideClass(hideOn?: Array<"mobile" | "tablet" | "desktop">) {
  if (!hideOn || hideOn.length === 0) return "";
  const classes: string[] = [];
  // Mobile = below sm (640px). We hide by default and re-show at the next breakpoint.
  if (hideOn.includes("mobile") && hideOn.includes("tablet") && hideOn.includes("desktop")) {
    return "hidden";
  }
  if (hideOn.includes("mobile")) classes.push("hidden", "sm:block");
  if (hideOn.includes("tablet")) classes.push("sm:hidden", "lg:block");
  if (hideOn.includes("desktop")) classes.push("lg:hidden");
  return classes.join(" ");
}

function getMaxWidthClass(maxWidth?: string) {
  switch (maxWidth) {
    case "4xl": return "max-w-4xl";
    case "5xl": return "max-w-5xl";
    case "6xl": return "max-w-6xl";
    case "7xl": return "max-w-7xl";
    case "full": return "max-w-full";
    default: return "max-w-7xl";
  }
}

type RenderCtx = {
  locale: Locale;
};

type SectionRender = (
  props: { content: Record<string, unknown>; ctx: RenderCtx }
) => React.ReactNode | Promise<React.ReactNode>;

/* ============================================
   PRIMITIVE SECTIONS (generic, no data fetch)
   ============================================ */

function PageHeaderSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const title = pickContent(content, "title", ctx.locale);
  const subtitle = pickContent(content, "subtitle", ctx.locale);
  const accent = (content.accent as string) || "neon-green";
  if (!title) return null;
  const accentClass =
    accent === "purple"
      ? "from-jungle-500 to-accent-purple/50"
      : accent === "gold"
      ? "from-accent-gold/80 to-accent-gold/20"
      : "from-jungle-500 to-neon-green/50";
  return (
    <div className="mb-10 md:mb-12">
      <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
        {title}
      </h1>
      <div className={`mt-3 w-20 h-0.5 bg-gradient-to-r ${accentClass}`} />
      {subtitle && <p className="mt-4 text-gray-400 text-lg">{subtitle}</p>}
    </div>
  );
}

function HeroGenericSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const title = pickContent(content, "title", ctx.locale);
  const subtitle = pickContent(content, "subtitle", ctx.locale);
  const bgImage = (content.bgImage as string) || "";
  const ctaText = pickContent(content, "ctaText", ctx.locale);
  const ctaLink = (content.ctaLink as string) || "";
  const overlayOpacity = (content.overlayOpacity as number) || 60;

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {bgImage && (
        <div className="absolute inset-0">
          <Image src={bgImage} alt="" fill className="object-cover" unoptimized />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(5, 10, 5, ${overlayOpacity / 100})` }} />
        </div>
      )}
      {!bgImage && <div className="absolute inset-0 hero-animated-bg" />}
      <div className="relative z-10 text-center px-4">
        {title && (
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider neon-text">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-4 text-lg md:text-xl text-gray-300 tracking-widest uppercase">
            {subtitle}
          </p>
        )}
        {ctaText && ctaLink && (
          <div className="mt-8">
            <Link href={ctaLink} className="lit-btn lit-btn--primary animate-pulse-glow">
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function TextSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const title = pickContent(content, "title", ctx.locale);
  const body = pickContent(content, "body", ctx.locale);
  const alignment = (content.alignment as string) || "left";
  const alignClass =
    alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left";
  const isHtml = /<[a-z][\s\S]*>/i.test(body);

  return (
    <div className={alignClass}>
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide mb-4">
          {title}
          <div className={`mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50 ${alignment === "center" ? "mx-auto" : alignment === "right" ? "ml-auto" : ""}`} />
        </h2>
      )}
      {body && (
        isHtml ? (
          <div className="rich-content text-gray-300 leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mt-4">{body}</div>
        )
      )}
    </div>
  );
}

function ImageGallerySection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const title = pickContent(content, "title", ctx.locale);
  const images = ((content.images as string[]) || []).filter(Boolean);
  const columns = (content.columns as number) || 3;
  const gap = (content.gap as number) || 4;
  const gridCols =
    columns === 2 ? "grid-cols-1 md:grid-cols-2" :
    columns === 4 ? "grid-cols-2 md:grid-cols-4" :
    "grid-cols-1 md:grid-cols-3";
  if (images.length === 0) return null;
  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold text-white tracking-wide mb-8">
          {title}
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50" />
        </h2>
      )}
      <div className={`grid ${gridCols}`} style={{ gap: `${gap * 4}px` }}>
        {images.map((img, i) => (
          <div key={i} className="aspect-square relative rounded-sm overflow-hidden card-glow neon-border">
            <Image src={img} alt="" fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>
    </div>
  );
}

function CTASection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const title = pickContent(content, "title", ctx.locale);
  const description = pickContent(content, "description", ctx.locale);
  const buttonText = pickContent(content, "buttonText", ctx.locale);
  const buttonLink = (content.buttonLink as string) || "";
  const buttonStyle = (content.buttonStyle as string) || "primary";
  const btnClass =
    buttonStyle === "outline"
      ? "lit-btn lit-btn--secondary"
      : buttonStyle === "neon"
      ? "lit-btn lit-btn--ghost animate-pulse-glow"
      : "lit-btn lit-btn--primary animate-pulse-glow";
  return (
    <div className="text-center py-12">
      {title && <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>}
      {description && <p className="text-gray-400 mb-8 max-w-2xl mx-auto">{description}</p>}
      {buttonText && buttonLink && (
        <Link href={buttonLink} className={btnClass}>
          {buttonText}
        </Link>
      )}
    </div>
  );
}

function DividerSection({ content }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const style = (content.style as string) || "gradient";
  const color = (content.color as string) || "";
  if (style === "neon") return <div className="h-px bg-gradient-to-r from-transparent via-neon-green/40 to-transparent" />;
  if (style === "dots") {
    return (
      <div className="flex justify-center gap-2 py-4">
        <div className="w-1.5 h-1.5 rounded-full bg-jungle-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-jungle-600" />
        <div className="w-1.5 h-1.5 rounded-full bg-jungle-500" />
      </div>
    );
  }
  if (style === "line") return <div className="h-px" style={{ backgroundColor: color || "rgba(26, 42, 26, 0.5)" }} />;
  return <div className="h-px bg-gradient-to-r from-transparent via-jungle-600/50 to-transparent" />;
}

function SpacerSection({ content }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const height = (content.height as number) || 60;
  return <div style={{ height: `${height}px` }} />;
}

function EmbedSection({ content }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const url = (content.url as string) || "";
  const width = (content.width as string) || "100%";
  const height = (content.height as number) || 400;
  if (!url) return null;
  let embedUrl = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
  return (
    <div className="relative rounded-sm overflow-hidden neon-border" style={{ width }}>
      <iframe src={embedUrl} width="100%" height={height} className="border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>
  );
}

function ColumnsSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const items = (content.items as Array<{ title?: string; titleEn?: string; text?: string; textEn?: string; image?: string }>) || [];
  const numCols = items.length || 2;
  const gridCols =
    numCols === 2 ? "grid-cols-1 md:grid-cols-2" :
    numCols === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
    "grid-cols-1 md:grid-cols-3";
  return (
    <div className={`grid ${gridCols} gap-8`}>
      {items.map((col, i) => {
        const title = ctx.locale === "en" && col.titleEn ? col.titleEn : col.title || "";
        const text = ctx.locale === "en" && col.textEn ? col.textEn : col.text || "";
        return (
          <div key={i} className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow">
            {col.image && (
              <div className="relative aspect-video mb-4 rounded-sm overflow-hidden">
                <Image src={col.image} alt="" fill className="object-cover" unoptimized />
              </div>
            )}
            {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
            {text && <p className="text-gray-400 text-sm leading-relaxed">{text}</p>}
          </div>
        );
      })}
    </div>
  );
}

function TestimonialsSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const title = pickContent(content, "title", ctx.locale);
  const items = (content.items as Array<{ name: string; text: string; textEn?: string; rating?: number }>) || [];
  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold text-white tracking-wide mb-8 text-center">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const text = ctx.locale === "en" && item.textEn ? item.textEn : item.text;
          return (
            <div key={i} className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow">
              {item.rating && (
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className={j < (item.rating ?? 0) ? "text-accent-gold" : "text-gray-600"}>★</span>
                  ))}
                </div>
              )}
              <p className="text-gray-300 text-sm leading-relaxed italic mb-4">&ldquo;{text}&rdquo;</p>
              <p className="text-white text-sm font-semibold">— {item.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function CountdownSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const titleOverride = pickContent(content, "title", ctx.locale);
  const descriptionOverride = pickContent(content, "description", ctx.locale);
  const targetDate = (content.targetDate as string) || "";
  const autoNextEvent = content.autoNextEvent === true || content.autoNextEvent === "true";

  let resolvedTarget = targetDate;
  let resolvedTitle = titleOverride;
  let resolvedDescription = descriptionOverride;

  if (autoNextEvent) {
    try {
      const next = await prisma.event.findFirst({
        where: { published: true, date: { gte: new Date() } },
        orderBy: { date: "asc" },
        select: { title: true, titleEn: true, slug: true, date: true },
      });
      if (next) {
        resolvedTarget = next.date.toISOString();
        if (!titleOverride) resolvedTitle = pickLocalized(next, "title", ctx.locale);
        if (!descriptionOverride) {
          resolvedDescription = new Intl.DateTimeFormat(ctx.locale === "en" ? "en-GB" : "pt-PT", {
            weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
          }).format(next.date);
        }
      } else if (!targetDate) {
        return null;
      }
    } catch {
      if (!targetDate) return null;
    }
  }

  return (
    <div className="text-center py-12">
      {resolvedTitle && <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 neon-text">{resolvedTitle}</h2>}
      {resolvedDescription && <p className="text-gray-400 mb-8 capitalize">{resolvedDescription}</p>}
      {resolvedTarget && <Countdown targetDate={resolvedTarget} />}
    </div>
  );
}

/* ============================================
   CMS / DATA-DRIVEN SECTIONS
   ============================================ */

async function HeroHomeSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const settings = await getSettings().catch(() => null);
  const title = pickContent(content, "title", ctx.locale) ||
    (ctx.locale === "en" ? (settings as unknown as { heroTitle__en?: string })?.heroTitle__en : undefined) ||
    settings?.heroTitle || "LIT";
  const subtitle = pickContent(content, "subtitle", ctx.locale) ||
    (ctx.locale === "en" ? (settings as unknown as { heroSubtitle__en?: string })?.heroSubtitle__en : undefined) ||
    settings?.heroSubtitle || "";
  const heroImage = (content.heroImage as string) || settings?.heroImage || "";
  const heroVideo = (content.heroVideo as string) || settings?.heroVideo || "";
  const showReservations = content.showReservations !== false;
  return (
    <Hero
      title={title}
      subtitle={subtitle}
      heroImage={heroImage}
      heroVideo={heroVideo}
      showReservations={showReservations}
    />
  );
}

async function NextEventCountdownSection({ ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  try {
    const next = await prisma.event.findFirst({
      where: { published: true, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      select: { title: true, titleEn: true, slug: true, date: true },
    });
    if (!next) return null;
    return (
      <NextEventCountdown
        title={pickLocalized(next, "title", ctx.locale)}
        slug={next.slug}
        date={next.date}
      />
    );
  } catch {
    return null;
  }
}

async function EventsPreviewSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const limit = Math.max(1, Math.min(12, Number(content.limit) || 4));
  try {
    const events = await prisma.event.findMany({
      where: { published: true, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: limit,
      select: { id: true, title: true, titleEn: true, slug: true, date: true, image: true, eventType: true },
    });
    if (events.length === 0) return null;
    const localized = events.map((e) => ({
      ...e,
      title: pickLocalized(e, "title", ctx.locale),
    }));
    return <EventsPreview events={localized} />;
  } catch {
    return null;
  }
}

async function EventsGridSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  try {
    const all = await prisma.event.findMany({
      where: { published: true },
      orderBy: { date: "asc" },
    });
    const serialized = all.map((e) => ({
      id: e.id,
      title: pickLocalized(e, "title", ctx.locale),
      slug: e.slug,
      date: e.date,
      image: e.image,
      lineup: pickLocalized(e, "lineup", ctx.locale),
      eventType: e.eventType,
      featured: e.featured,
    }));
    const title = pickContent(content, "title", ctx.locale);
    return (
      <div>
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide mb-8">
            {title}
            <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50" />
          </h2>
        )}
        <EventsFilterView events={serialized} />
      </div>
    );
  } catch {
    return null;
  }
}

async function GalleriesPreviewSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const limit = Math.max(1, Math.min(12, Number(content.limit) || 6));
  try {
    const galleries = await prisma.gallery.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      take: limit,
      select: { id: true, title: true, titleEn: true, slug: true, coverImage: true, date: true },
    });
    if (galleries.length === 0) return null;
    const localized = galleries.map((g) => ({
      ...g,
      title: pickLocalized(g, "title", ctx.locale),
    }));
    return <GalleryPreview galleries={localized} />;
  } catch {
    return null;
  }
}

async function GalleriesGridSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  try {
    const all = await prisma.gallery.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      include: { _count: { select: { photos: true } } },
    });
    const serialized = all.map((g) => ({
      id: g.id,
      title: pickLocalized(g, "title", ctx.locale),
      slug: g.slug,
      date: g.date,
      coverImage: g.coverImage,
      photoCount: g._count.photos,
    }));
    const title = pickContent(content, "title", ctx.locale);
    return (
      <div>
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide mb-8">
            {title}
            <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-accent-purple/50" />
          </h2>
        )}
        <GalleriesFilterView galleries={serialized} />
      </div>
    );
  } catch {
    return null;
  }
}

async function ContactCtaSection({ content }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  try {
    const settings = await getSettings();
    return (
      <ContactCTA
        email={(content.email as string) || settings.email}
        instagram={(content.instagram as string) || settings.instagram}
        facebook={(content.facebook as string) || settings.facebook}
      />
    );
  } catch {
    return null;
  }
}

async function ContactInfoSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  try {
    const settings = await getSettings();
    const title = pickContent(content, "title", ctx.locale) ||
      (ctx.locale === "en" ? "Talk to us" : "Fala connosco");
    const intro = pickContent(content, "intro", ctx.locale) ||
      (ctx.locale === "en"
        ? "Got a question or suggestion? Reach out through the channels below."
        : "Tens alguma questão ou sugestão? Entra em contacto através dos seguintes meios.");
    const showEmail = content.showEmail !== false;
    const showPhone = content.showPhone !== false;
    const showAddress = content.showAddress !== false;
    const showSocials = content.showSocials !== false;
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        <p className="text-gray-400 mb-8">{intro}</p>
        <div className="space-y-4">
          {showEmail && settings.email && (
            <div className="flex items-center gap-3 p-3 rounded-sm hover:bg-jungle-900/50 transition-colors duration-300 group">
              <div className="w-8 h-8 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors">
                <Mail size={16} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />
              </div>
              <a href={`mailto:${settings.email}`} className="text-gray-300 hover:text-white transition-colors">{settings.email}</a>
            </div>
          )}
          {showPhone && settings.phone && (
            <div className="flex items-center gap-3 p-3 rounded-sm hover:bg-jungle-900/50 transition-colors duration-300 group">
              <div className="w-8 h-8 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors">
                <Phone size={16} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />
              </div>
              <a href={`tel:${settings.phone}`} className="text-gray-300 hover:text-white transition-colors">{settings.phone}</a>
            </div>
          )}
          {showAddress && settings.address && (
            <div className="flex items-center gap-3 p-3 rounded-sm hover:bg-jungle-900/50 transition-colors duration-300 group">
              <div className="w-8 h-8 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors">
                <MapPin size={16} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />
              </div>
              <span className="text-gray-300">{settings.address}</span>
            </div>
          )}
        </div>
        {showSocials && (settings.instagram || settings.facebook) && (
          <div className="flex gap-4 mt-8">
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-pink hover:border-accent-pink transition-all" aria-label="Instagram">
                <InstagramIcon size={20} />
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-blue hover:border-accent-blue transition-all" aria-label="Facebook">
                <FacebookIcon size={20} />
              </a>
            )}
          </div>
        )}
      </div>
    );
  } catch {
    return null;
  }
}

function ContactFormSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const title = pickContent(content, "title", ctx.locale);
  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      )}
      <ContactForm />
    </div>
  );
}

async function ContactMapSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  try {
    const settings = await getSettings();
    const lat = Number(content.lat) || parseFloat(settings.mapLatitude || "");
    const lng = Number(content.lng) || parseFloat(settings.mapLongitude || "");
    if (!isFinite(lat) || !isFinite(lng)) return null;
    const title = pickContent(content, "title", ctx.locale) ||
      (ctx.locale === "en" ? "Where we are" : "Onde estamos");
    return (
      <div>
        {title && (
          <h2 className="text-xl font-semibold text-jungle-400 uppercase tracking-wider mb-4">{title}</h2>
        )}
        <ContactMap lat={lat} lng={lng} label={settings.siteName || "LIT"} zoom={Number(content.zoom) || 16} />
      </div>
    );
  } catch {
    return null;
  }
}

function ReservationFormSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const titleOverride = pickContent(content, "title", ctx.locale);
  const subtitleOverride = pickContent(content, "subtitle", ctx.locale);
  const showEventSelector = content.showEventSelector !== false;
  const showHeader = content.showHeader !== false;
  return (
    <ReservationForm
      showEventSelector={showEventSelector}
      showHeader={showHeader}
      titleOverride={titleOverride || undefined}
      subtitleOverride={subtitleOverride || undefined}
    />
  );
}

/** Lookup table shared by InfoCards / IconBox / etc. Returns lucide React node by key. */
type IconRender = (size: number, className?: string) => React.ReactNode;
const ICON_REGISTRY: Record<string, IconRender> = {
  mapPin: (s, c) => <MapPin size={s} className={c} />,
  clock: (s, c) => <Clock size={s} className={c} />,
  mail: (s, c) => <Mail size={s} className={c} />,
  phone: (s, c) => <Phone size={s} className={c} />,
  calendar: (s, c) => <Calendar size={s} className={c} />,
  crown: (s, c) => <Crown size={s} className={c} />,
  arrow: (s, c) => <ArrowRight size={s} className={c} />,
  star: (s, c) => <Star size={s} className={c} />,
  heart: (s, c) => <Heart size={s} className={c} />,
  award: (s, c) => <Award size={s} className={c} />,
  gift: (s, c) => <Gift size={s} className={c} />,
  music: (s, c) => <Music size={s} className={c} />,
  sparkles: (s, c) => <Sparkles size={s} className={c} />,
  zap: (s, c) => <Zap size={s} className={c} />,
  shield: (s, c) => <Shield size={s} className={c} />,
  wine: (s, c) => <Wine size={s} className={c} />,
  glass: (s, c) => <GlassWater size={s} className={c} />,
  users: (s, c) => <Users size={s} className={c} />,
  instagram: (s, c) => <InstagramIcon size={s} className={c} />,
  facebook: (s, c) => <FacebookIcon size={s} className={c} />,
};

export const ICON_KEYS = Object.keys(ICON_REGISTRY);

function renderIcon(key: string | undefined, size = 24, className?: string): React.ReactNode {
  const fn = ICON_REGISTRY[key || "sparkles"] ?? ICON_REGISTRY.sparkles;
  return fn(size, className);
}

/** Standalone styled heading. Useful as a divider/title in long-form pages. */
function HeadingSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  const text = pickContent(content, "text", ctx.locale);
  if (!text) return null;
  const level = String(content.level || "h2");
  const align = String(content.align || "left"); // "left" | "center" | "right"
  const size = String(content.size || "lg"); // "sm" | "md" | "lg" | "xl"
  const decoration = content.decoration === true; // underline accent bar

  const sizeClasses: Record<string, string> = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
  };
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  const Tag = (level === "h1" || level === "h3" || level === "h4" ? level : "h2") as
    | "h1" | "h2" | "h3" | "h4";

  return (
    <div className={alignClass}>
      <Tag className={cn("font-bold text-white tracking-wide", sizeClasses[size] || sizeClasses.lg)}>
        {text}
      </Tag>
      {decoration && (
        <div
          className={cn(
            "mt-3 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50",
            align === "center" ? "mx-auto w-24" : align === "right" ? "ml-auto w-24" : "w-24"
          )}
        />
      )}
    </div>
  );
}

/** Grid of icon + title + body cards. Icons drawn from the shared registry. */
function IconBoxSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  type Item = { icon?: string; title?: string; titleEn?: string; text?: string; textEn?: string };
  const items = Array.isArray(content.items) ? (content.items as Item[]) : [];
  const cols = Number(content.columns) || 3;
  const layout = String(content.layout || "centered"); // "centered" | "left"
  const title = pickContent(content, "title", ctx.locale);
  const intro = pickContent(content, "intro", ctx.locale);

  const colsClass =
    cols === 4 ? "md:grid-cols-2 lg:grid-cols-4"
    : cols === 2 ? "md:grid-cols-2"
    : "md:grid-cols-3";

  if (items.length === 0 && !title) return null;

  return (
    <div>
      {(title || intro) && (
        <div className="text-center mb-10">
          {title && <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>}
          {intro && <p className="text-gray-400 mt-3 max-w-2xl mx-auto">{intro}</p>}
        </div>
      )}
      <div className={`grid grid-cols-1 ${colsClass} gap-6`}>
        {items.map((item, i) => {
          const ttl = ctx.locale === "en" && item.titleEn ? item.titleEn : item.title || "";
          const txt = ctx.locale === "en" && item.textEn ? item.textEn : item.text || "";
          return (
            <div
              key={i}
              className={cn(
                "p-6 bg-jungle-900/40 border border-jungle-700/30 rounded-sm hover:border-jungle-600/50 transition-colors",
                layout === "centered" ? "text-center" : "text-left"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full bg-jungle-800 flex items-center justify-center mb-4",
                  layout === "centered" && "mx-auto"
                )}
              >
                {renderIcon(item.icon, 22, "text-jungle-400")}
              </div>
              {ttl && <h3 className="text-white font-semibold mb-2">{ttl}</h3>}
              {txt && <p className="text-gray-400 text-sm leading-relaxed">{txt}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoCardsSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  type Card = { icon?: string; title?: string; titleEn?: string; text?: string; textEn?: string; link?: string };
  const items = (content.items as Card[]) || [];
  const title = pickContent(content, "title", ctx.locale);
  const columns = Number(content.columns) || 2;
  const gridCols =
    columns === 1 ? "grid-cols-1" :
    columns === 3 ? "grid-cols-1 md:grid-cols-3" :
    columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
    "grid-cols-1 md:grid-cols-2";

  const iconMap: Record<string, React.ReactNode> = {
    mapPin: <MapPin size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />,
    clock: <Clock size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />,
    mail: <Mail size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />,
    phone: <Phone size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />,
    calendar: <Calendar size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />,
    crown: <Crown size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />,
    arrow: <ArrowRight size={18} className="text-jungle-400 group-hover:text-neon-green/70 transition-colors" />,
  };

  return (
    <div>
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide mb-8">
          {title}
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50" />
        </h2>
      )}
      <div className={`grid ${gridCols} gap-6`}>
        {items.map((card, i) => {
          const ttl = ctx.locale === "en" && card.titleEn ? card.titleEn : card.title || "";
          const txt = ctx.locale === "en" && card.textEn ? card.textEn : card.text || "";
          const Wrapper = card.link
            ? ({ children }: { children: React.ReactNode }) => (
                <Link href={card.link!} className="block">{children}</Link>
              )
            : ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
          return (
            <Wrapper key={i}>
              <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow group h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-jungle-800 flex items-center justify-center group-hover:bg-jungle-700 transition-colors">
                    {iconMap[card.icon || "mapPin"] || iconMap.mapPin}
                  </div>
                  {ttl && <h3 className="text-white font-semibold">{ttl}</h3>}
                </div>
                {txt && <p className="text-gray-400 text-sm">{txt}</p>}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

/** Pricing / package cards. Built for VIP table & bottle-service offers. */
function PricingSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  type Plan = {
    name: string;
    nameEn?: string;
    price: string;
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
  const items = Array.isArray(content.items) ? (content.items as Plan[]) : [];
  const title = pickContent(content, "title", ctx.locale);
  const intro = pickContent(content, "intro", ctx.locale);
  const cols = Number(content.columns) || items.length || 3;
  const colsClass =
    cols >= 4 ? "md:grid-cols-2 lg:grid-cols-4"
    : cols === 3 ? "md:grid-cols-3"
    : cols === 2 ? "md:grid-cols-2"
    : "md:grid-cols-1";

  if (items.length === 0 && !title) return null;

  return (
    <div>
      {(title || intro) && (
        <div className="text-center mb-10">
          {title && <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>}
          {intro && <p className="text-gray-400 mt-3 max-w-2xl mx-auto">{intro}</p>}
        </div>
      )}

      <div className={`grid grid-cols-1 ${colsClass} gap-6`}>
        {items.map((plan, i) => {
          const name = ctx.locale === "en" && plan.nameEn ? plan.nameEn : plan.name || "";
          const priceLabel =
            ctx.locale === "en" && plan.priceLabelEn ? plan.priceLabelEn : plan.priceLabel || "";
          const description =
            ctx.locale === "en" && plan.descriptionEn ? plan.descriptionEn : plan.description || "";
          const features =
            (ctx.locale === "en" && plan.featuresEn?.length ? plan.featuresEn : plan.features) || [];
          const ctaText =
            ctx.locale === "en" && plan.ctaTextEn ? plan.ctaTextEn : plan.ctaText || "";
          const badge = ctx.locale === "en" && plan.badgeEn ? plan.badgeEn : plan.badge || "";
          return (
            <div
              key={i}
              className={cn(
                "relative p-6 lit-card flex flex-col",
                plan.highlight && "ring-2 ring-jungle-400/60 scale-[1.02]"
              )}
            >
              {badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-jungle-500 text-white rounded-sm">
                  {badge}
                </span>
              )}
              {name && <h3 className="text-xl font-bold text-white">{name}</h3>}
              {description && <p className="text-gray-400 text-sm mt-2">{description}</p>}
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price || ""}</span>
                {priceLabel && <span className="text-sm text-gray-500">{priceLabel}</span>}
              </div>
              {features.length > 0 && (
                <ul className="mt-5 space-y-2 flex-1">
                  {features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-jungle-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
              {ctaText && plan.ctaLink && (
                <Link
                  href={plan.ctaLink}
                  className={cn(
                    "lit-btn mt-6 w-full",
                    plan.highlight ? "lit-btn--primary" : "lit-btn--secondary"
                  )}
                >
                  {ctaText}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A row of CTA buttons. Useful for sticky action bars or hero sub-CTAs. */
function ButtonGroupSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  type Button = {
    label: string;
    labelEn?: string;
    link: string;
    style?: "primary" | "secondary" | "ghost";
    icon?: string;
  };
  const buttons = Array.isArray(content.buttons) ? (content.buttons as Button[]) : [];
  const align = String(content.align || "center"); // "left" | "center" | "right"
  const layout = String(content.layout || "row"); // "row" | "column" — column stacks even on desktop

  if (buttons.length === 0) return null;

  const alignClass = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
  const layoutClass =
    layout === "column" ? "flex-col items-stretch" : "flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center";

  return (
    <div className={cn("flex gap-3", layoutClass, alignClass)}>
      {buttons.map((btn, i) => {
        const label = ctx.locale === "en" && btn.labelEn ? btn.labelEn : btn.label;
        const style = btn.style || "primary";
        const styleClass =
          style === "secondary"
            ? "lit-btn--secondary"
            : style === "ghost"
            ? "lit-btn--ghost"
            : "lit-btn--primary";
        return (
          <Link
            key={i}
            href={btn.link || "#"}
            className={cn("lit-btn", styleClass)}
          >
            {btn.icon && renderIcon(btn.icon, 16)}
            {label}
          </Link>
        );
      })}
    </div>
  );
}

/** Greyscale-on-rest, colour-on-hover logo strip. Optionally clickable. */
function LogosSection({ content, ctx }: { content: Record<string, unknown>; ctx: RenderCtx }) {
  type Logo = { src: string; alt?: string; href?: string };
  const items = Array.isArray(content.items) ? (content.items as Logo[]) : [];
  const title = pickContent(content, "title", ctx.locale);
  const grayscale = content.grayscale !== false; // default true
  const cols = Number(content.columns) || 5;
  const colsClass =
    cols === 6 ? "grid-cols-3 md:grid-cols-6"
    : cols === 4 ? "grid-cols-2 md:grid-cols-4"
    : cols === 3 ? "grid-cols-2 md:grid-cols-3"
    : "grid-cols-2 md:grid-cols-5";

  const visible = items.filter((l) => l.src);
  if (visible.length === 0 && !title) return null;

  return (
    <div>
      {title && (
        <p className="text-center text-sm uppercase tracking-widest text-jungle-400 mb-6">
          {title}
        </p>
      )}
      <div className={`grid ${colsClass} gap-6 items-center`}>
        {visible.map((logo, i) => {
          const Wrapper = logo.href
            ? ({ children }: { children: React.ReactNode }) => (
                <Link
                  href={logo.href!}
                  target={logo.href!.startsWith("http") ? "_blank" : undefined}
                  rel={logo.href!.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  {children}
                </Link>
              )
            : ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
          return (
            <Wrapper key={i}>
              <div className="relative h-12 md:h-14 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.alt || ""}
                  className={cn(
                    "max-h-full max-w-full object-contain transition-all duration-300",
                    grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                  )}
                />
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================
   MAIN RENDERER
   ============================================ */

const SECTION_COMPONENTS: Record<string, SectionRender> = {
  // generic primitives
  page_header: PageHeaderSection,
  hero: HeroGenericSection,
  text: TextSection,
  image_gallery: ImageGallerySection,
  cta: CTASection,
  divider: DividerSection,
  spacer: SpacerSection,
  embed: EmbedSection,
  columns: ColumnsSection,
  testimonials: TestimonialsSection,
  countdown: CountdownSection,
  // CMS / data-driven
  hero_home: HeroHomeSection,
  next_event_countdown: NextEventCountdownSection,
  events_preview: EventsPreviewSection,
  events_grid: EventsGridSection,
  galleries_preview: GalleriesPreviewSection,
  galleries_grid: GalleriesGridSection,
  contact_cta: ContactCtaSection,
  contact_info: ContactInfoSection,
  contact_form: ContactFormSection,
  contact_map: ContactMapSection,
  reservation_form: ReservationFormSection,
  info_cards: InfoCardsSection,
  // Elementor-inspired primitives
  heading: HeadingSection,
  icon_box: IconBoxSection,
  accordion: AccordionSection,
  stats: StatsSection,
  tabs: TabsSection,
  pricing: PricingSection,
  button_group: ButtonGroupSection,
  logos: LogosSection,
};

export const REGISTERED_SECTION_TYPES = Object.keys(SECTION_COMPONENTS);

export default async function SectionRenderer({
  sections,
  locale,
}: {
  sections: Section[];
  locale?: Locale;
}) {
  const resolvedLocale: Locale = locale || (await getServerLocale().catch(() => "pt" as const));
  const visibleSections = sections.filter((s) => s.visible);
  if (visibleSections.length === 0) return null;
  const ctx: RenderCtx = { locale: resolvedLocale };

  return (
    <>
      {visibleSections.map((section) => {
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;

        const content = parseJSON(section.content) as Record<string, unknown>;
        const spacing = parseJSON(section.spacing) as SpacingConfig;
        const spacingStyle = getSpacingStyle(spacing);
        const maxWidthClass = getMaxWidthClass(spacing.maxWidth);
        const fullBleed = spacing.fullBleed === true || section.type === "hero_home";
        const hideClass = getResponsiveHideClass(spacing.hideOn);
        const customClass = (spacing.customClass || "").trim();
        const sectionId = (spacing.anchorId || "").trim() || undefined;

        // Inner content (centred wrapper or full bleed)
        const inner = fullBleed ? (
          <Component content={content} ctx={ctx} />
        ) : (
          <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 relative z-10`}>
            <Component content={content} ctx={ctx} />
          </div>
        );

        // Optional scroll-triggered animation
        const wrapped =
          spacing.animation && spacing.animation !== "none" ? (
            <Reveal animation={spacing.animation} delay={spacing.animationDelay ?? 0}>
              {inner}
            </Reveal>
          ) : (
            inner
          );

        const hasBgLayer = !!spacing.bgImage || !!spacing.bgVideo;

        return (
          <section
            key={section.id}
            id={sectionId}
            style={spacingStyle}
            className={cn("relative overflow-hidden", hideClass, customClass)}
          >
            {/* Background layer (image / video) sits beneath everything */}
            {hasBgLayer && (
              <div className="absolute inset-0 z-0">
                {spacing.bgVideo && (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={spacing.bgVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {!spacing.bgVideo && spacing.bgImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${spacing.bgImage})` }}
                  />
                )}
              </div>
            )}

            {/* Optional colour overlay above the bg layer, below the content */}
            {spacing.bgOverlay && (
              <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ backgroundColor: spacing.bgOverlay }}
              />
            )}

            {wrapped}
          </section>
        );
      })}
    </>
  );
}
