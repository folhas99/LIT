import Image from "next/image";
import Link from "next/link";

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

function parseJSON(str: string | null, fallback: Record<string, unknown> = {}) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getSpacingStyle(spacing: SpacingConfig) {
  return {
    marginTop: spacing.marginTop ? `${spacing.marginTop}px` : undefined,
    marginBottom: spacing.marginBottom ? `${spacing.marginBottom}px` : undefined,
    paddingTop: spacing.paddingTop ? `${spacing.paddingTop}px` : undefined,
    paddingRight: spacing.paddingRight ? `${spacing.paddingRight}px` : undefined,
    paddingBottom: spacing.paddingBottom ? `${spacing.paddingBottom}px` : undefined,
    paddingLeft: spacing.paddingLeft ? `${spacing.paddingLeft}px` : undefined,
    backgroundColor: spacing.bgColor || undefined,
    background: spacing.bgGradient || undefined,
    backgroundImage: spacing.bgImage ? `url(${spacing.bgImage})` : undefined,
    backgroundSize: spacing.bgImage ? "cover" : undefined,
    backgroundPosition: spacing.bgImage ? "center" : undefined,
    borderRadius: spacing.borderRadius ? `${spacing.borderRadius}px` : undefined,
  };
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

/* ============================================
   SECTION TYPE RENDERERS
   ============================================ */

function HeroSection({ content }: { content: Record<string, unknown> }) {
  const title = (content.title as string) || "";
  const subtitle = (content.subtitle as string) || "";
  const bgImage = (content.bgImage as string) || "";
  const ctaText = (content.ctaText as string) || "";
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
            <Link
              href={ctaLink}
              className="px-8 py-3 bg-jungle-600 hover:bg-jungle-500 text-white font-semibold tracking-wider uppercase text-sm transition-all duration-300 rounded-sm animate-pulse-glow"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function TextSection({ content }: { content: Record<string, unknown> }) {
  const title = (content.title as string) || "";
  const body = (content.body as string) || "";
  const alignment = (content.alignment as string) || "left";
  const alignClass = alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left";

  return (
    <div className={alignClass}>
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide mb-4">
          {title}
          <div className={`mt-3 w-20 h-0.5 bg-gradient-to-r from-jungle-500 to-neon-green/50 ${alignment === "center" ? "mx-auto" : alignment === "right" ? "ml-auto" : ""}`} />
        </h2>
      )}
      {body && (
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mt-4">
          {body}
        </div>
      )}
    </div>
  );
}

function ImageGallerySection({ content }: { content: Record<string, unknown> }) {
  const title = (content.title as string) || "";
  const images = (content.images as string[]) || [];
  const columns = (content.columns as number) || 3;
  const gap = (content.gap as number) || 4;

  const gridCols =
    columns === 2 ? "grid-cols-1 md:grid-cols-2" :
    columns === 4 ? "grid-cols-2 md:grid-cols-4" :
    "grid-cols-1 md:grid-cols-3";

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

function CTASection({ content }: { content: Record<string, unknown> }) {
  const title = (content.title as string) || "";
  const description = (content.description as string) || "";
  const buttonText = (content.buttonText as string) || "";
  const buttonLink = (content.buttonLink as string) || "";
  const buttonStyle = (content.buttonStyle as string) || "primary";

  const btnClass =
    buttonStyle === "outline"
      ? "border border-white/20 hover:border-neon-green/40 text-white hover:shadow-[0_0_15px_rgba(57,255,20,0.1)]"
      : buttonStyle === "neon"
      ? "bg-neon-green/20 border border-neon-green/40 text-neon-green hover:bg-neon-green/30 animate-pulse-glow"
      : "bg-jungle-600 hover:bg-jungle-500 text-white animate-pulse-glow";

  return (
    <div className="text-center py-12">
      {title && <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>}
      {description && <p className="text-gray-400 mb-8 max-w-2xl mx-auto">{description}</p>}
      {buttonText && buttonLink && (
        <Link
          href={buttonLink}
          className={`inline-block px-8 py-3 font-semibold tracking-wider uppercase text-sm transition-all duration-300 rounded-sm ${btnClass}`}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}

function DividerSection({ content }: { content: Record<string, unknown> }) {
  const style = (content.style as string) || "gradient";
  const color = (content.color as string) || "";

  if (style === "neon") {
    return <div className="h-px bg-gradient-to-r from-transparent via-neon-green/40 to-transparent" />;
  }
  if (style === "dots") {
    return (
      <div className="flex justify-center gap-2 py-4">
        <div className="w-1.5 h-1.5 rounded-full bg-jungle-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-jungle-600" />
        <div className="w-1.5 h-1.5 rounded-full bg-jungle-500" />
      </div>
    );
  }
  if (style === "line") {
    return <div className="h-px" style={{ backgroundColor: color || "rgba(26, 42, 26, 0.5)" }} />;
  }
  // gradient (default)
  return <div className="h-px bg-gradient-to-r from-transparent via-jungle-600/50 to-transparent" />;
}

function SpacerSection({ content }: { content: Record<string, unknown> }) {
  const height = (content.height as number) || 60;
  return <div style={{ height: `${height}px` }} />;
}

function EmbedSection({ content }: { content: Record<string, unknown> }) {
  const url = (content.url as string) || "";
  const width = (content.width as string) || "100%";
  const height = (content.height as number) || 400;

  if (!url) return null;

  // Convert YouTube URLs to embed format
  let embedUrl = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  return (
    <div className="relative rounded-sm overflow-hidden neon-border" style={{ width }}>
      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        className="border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function ColumnsSection({ content }: { content: Record<string, unknown> }) {
  const columns = (content.columns as Array<{ title?: string; text?: string; image?: string }>) || [];
  const numCols = columns.length || 2;
  const gridCols =
    numCols === 2 ? "grid-cols-1 md:grid-cols-2" :
    numCols === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
    "grid-cols-1 md:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-8`}>
      {columns.map((col, i) => (
        <div key={i} className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow">
          {col.image && (
            <div className="relative aspect-video mb-4 rounded-sm overflow-hidden">
              <Image src={col.image} alt="" fill className="object-cover" unoptimized />
            </div>
          )}
          {col.title && <h3 className="text-lg font-semibold text-white mb-2">{col.title}</h3>}
          {col.text && <p className="text-gray-400 text-sm leading-relaxed">{col.text}</p>}
        </div>
      ))}
    </div>
  );
}

function TestimonialsSection({ content }: { content: Record<string, unknown> }) {
  const title = (content.title as string) || "";
  const items = (content.items as Array<{ name: string; text: string; rating?: number }>) || [];

  return (
    <div>
      {title && (
        <h2 className="text-3xl font-bold text-white tracking-wide mb-8 text-center">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <div key={i} className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border card-glow">
            {item.rating && (
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className={j < item.rating! ? "text-accent-gold" : "text-gray-600"}>★</span>
                ))}
              </div>
            )}
            <p className="text-gray-300 text-sm leading-relaxed italic mb-4">&ldquo;{item.text}&rdquo;</p>
            <p className="text-white text-sm font-semibold">— {item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountdownSection({ content }: { content: Record<string, unknown> }) {
  const title = (content.title as string) || "";
  const description = (content.description as string) || "";
  const targetDate = (content.targetDate as string) || "";

  // Note: This renders server-side with static values
  // A client component wrapper would be needed for live countdown
  return (
    <div className="text-center py-12">
      {title && <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 neon-text">{title}</h2>}
      {description && <p className="text-gray-400 mb-8">{description}</p>}
      {targetDate && (
        <div className="flex justify-center gap-4">
          {["Dias", "Horas", "Min", "Seg"].map((label) => (
            <div key={label} className="w-20 h-20 bg-jungle-900/50 border border-jungle-700/30 rounded-sm flex flex-col items-center justify-center neon-border">
              <span className="text-2xl font-bold text-white">--</span>
              <span className="text-[10px] text-gray-500 uppercase">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   MAIN RENDERER
   ============================================ */

const SECTION_COMPONENTS: Record<string, React.FC<{ content: Record<string, unknown> }>> = {
  hero: HeroSection,
  text: TextSection,
  image_gallery: ImageGallerySection,
  cta: CTASection,
  divider: DividerSection,
  spacer: SpacerSection,
  embed: EmbedSection,
  columns: ColumnsSection,
  testimonials: TestimonialsSection,
  countdown: CountdownSection,
};

export default function SectionRenderer({ sections }: { sections: Section[] }) {
  const visibleSections = sections.filter((s) => s.visible);

  if (visibleSections.length === 0) return null;

  return (
    <>
      {visibleSections.map((section) => {
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;

        const content = parseJSON(section.content) as Record<string, unknown>;
        const spacing = parseJSON(section.spacing) as SpacingConfig;
        const spacingStyle = getSpacingStyle(spacing);
        const maxWidthClass = getMaxWidthClass(spacing.maxWidth);

        return (
          <section key={section.id} style={spacingStyle} className="relative">
            <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8`}>
              <Component content={content} />
            </div>
          </section>
        );
      })}
    </>
  );
}
