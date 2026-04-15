"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Ctx = { locale: "pt" | "en" };
type Props = { content: Record<string, unknown>; ctx: Ctx };

type MarqueeItem = {
  /** Text item (takes precedence when both text and image are set). */
  text?: string;
  textEn?: string;
  /** Optional logo / image URL. Rendered at `itemHeight` px tall. */
  image?: string;
  imageAlt?: string;
  /** Optional click-through. */
  href?: string;
};

export default function MarqueeSection({ content, ctx }: Props) {
  const items: MarqueeItem[] = Array.isArray(content.items)
    ? (content.items as MarqueeItem[])
    : [];
  const direction = (content.direction as string) === "right" ? "right" : "left";
  const speed = typeof content.speed === "number" ? (content.speed as number) : 30; // seconds per loop
  const pauseOnHover = content.pauseOnHover !== false; // default true
  const separator = (content.separator as string) || "•";
  const itemHeight = typeof content.itemHeight === "number" ? (content.itemHeight as number) : 32;
  const textSize = (content.textSize as string) || "xl"; // md | lg | xl | 2xl | 3xl
  const grayscale = content.grayscale === true;
  const gap = typeof content.gap === "number" ? (content.gap as number) : 48; // px between items

  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-4">
        {ctx.locale === "en" ? "No marquee items." : "Sem itens no ticker."}
      </div>
    );
  }

  const textClass = cn(
    "font-semibold tracking-wide text-white",
    textSize === "md" && "text-base",
    textSize === "lg" && "text-lg md:text-xl",
    textSize === "xl" && "text-2xl md:text-3xl",
    textSize === "2xl" && "text-3xl md:text-4xl",
    textSize === "3xl" && "text-4xl md:text-5xl",
  );

  const renderItem = (item: MarqueeItem, i: number) => {
    const text =
      (ctx.locale === "en" ? item.textEn : item.text) ||
      item.text ||
      item.textEn ||
      "";
    const inner = item.image ? (
      <Image
        src={item.image}
        alt={item.imageAlt || text || "Logo"}
        width={160}
        height={itemHeight}
        className={cn("h-[var(--h)] w-auto object-contain", grayscale && "grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition")}
        style={{ ["--h" as string]: `${itemHeight}px` } as React.CSSProperties}
        unoptimized
      />
    ) : (
      <span className={textClass}>{text}</span>
    );

    const wrapped = item.href ? (
      <Link href={item.href} className="inline-flex items-center hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    ) : (
      <span className="inline-flex items-center">{inner}</span>
    );

    return (
      <span key={i} className="inline-flex items-center" style={{ gap: `${gap / 2}px` }}>
        {wrapped}
        {separator && (
          <span aria-hidden className="text-jungle-400/60 select-none" style={{ fontSize: "1.25em" }}>
            {separator}
          </span>
        )}
      </span>
    );
  };

  // Render twice back-to-back so the CSS translate -50% creates a seamless loop.
  return (
    <div
      className="lit-marquee"
      data-direction={direction}
      data-pause-on-hover={String(pauseOnHover)}
      style={{
        ["--marquee-speed" as string]: `${Math.max(5, speed)}s`,
        ["--marquee-gap" as string]: `${gap}px`,
      } as React.CSSProperties}
    >
      <div className="lit-marquee__track">
        {items.map(renderItem)}
        {items.map((item, i) => renderItem(item, i + items.length))}
      </div>
    </div>
  );
}
