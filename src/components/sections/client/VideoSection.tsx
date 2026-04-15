"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Ctx = { locale: "pt" | "en" };
type Props = { content: Record<string, unknown>; ctx: Ctx };

type Provider = "youtube" | "vimeo" | "file";

type Parsed = { provider: Provider; src: string; embedId?: string };

function parseVideoUrl(url: string): Parsed | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube — youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const yt =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^&]*&)*v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/.exec(
      trimmed,
    );
  if (yt) {
    return { provider: "youtube", src: trimmed, embedId: yt[1] };
  }

  // Vimeo — vimeo.com/ID or player.vimeo.com/video/ID
  const vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(trimmed);
  if (vm) {
    return { provider: "vimeo", src: trimmed, embedId: vm[1] };
  }

  // File — extension heuristic
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed) || trimmed.startsWith("/")) {
    return { provider: "file", src: trimmed };
  }

  // Fallback: treat unknown URL as file; the <video> tag will fail quietly.
  return { provider: "file", src: trimmed };
}

function aspectPaddingTop(aspectRatio: string): string {
  switch (aspectRatio) {
    case "1:1":
      return "100%";
    case "4:3":
      return "75%";
    case "21:9":
      return "42.857%";
    case "9:16":
      return "177.778%";
    case "16:9":
    default:
      return "56.25%";
  }
}

export default function VideoSection({ content, ctx }: Props) {
  const url = (content.url as string) || "";
  const poster = (content.poster as string) || "";
  const autoplay = content.autoplay === true;
  const loop = content.loop === true;
  const muted = content.muted !== false; // default true, required by browsers for autoplay
  const controls = content.controls !== false; // default true
  const aspectRatio = (content.aspectRatio as string) || "16:9";
  const maxWidth = (content.maxWidth as string) || "full"; // full | 4xl | 5xl | 6xl
  const title = (
    ctx.locale === "en" ? (content.titleEn as string) : (content.title as string)
  ) || "";
  const caption = (
    ctx.locale === "en" ? (content.captionEn as string) : (content.caption as string)
  ) || "";

  const parsed = useMemo(() => parseVideoUrl(url), [url]);
  const wrapperMax =
    maxWidth === "4xl"
      ? "max-w-4xl"
      : maxWidth === "5xl"
      ? "max-w-5xl"
      : maxWidth === "6xl"
      ? "max-w-6xl"
      : "max-w-full";

  if (!parsed) {
    return (
      <div className="text-center text-gray-500 text-sm py-8">
        {ctx.locale === "en" ? "Video not configured." : "Vídeo não configurado."}
      </div>
    );
  }

  const frameClass =
    "relative w-full overflow-hidden rounded-sm border border-jungle-700/30 bg-black";

  return (
    <div className={cn("mx-auto", wrapperMax)}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
          {title}
        </h2>
      )}
      <div
        className={frameClass}
        style={{ paddingTop: aspectPaddingTop(aspectRatio) }}
      >
        {parsed.provider === "youtube" && parsed.embedId && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${parsed.embedId}?rel=0${
              autoplay ? "&autoplay=1&mute=1" : ""
            }${loop ? `&loop=1&playlist=${parsed.embedId}` : ""}${
              controls ? "" : "&controls=0"
            }`}
            title={title || "Video"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        )}

        {parsed.provider === "vimeo" && parsed.embedId && (
          <iframe
            src={`https://player.vimeo.com/video/${parsed.embedId}?dnt=1${
              autoplay ? "&autoplay=1&muted=1" : ""
            }${loop ? "&loop=1" : ""}${controls ? "" : "&controls=0"}`}
            title={title || "Video"}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        )}

        {parsed.provider === "file" && (
          <video
            src={parsed.src}
            poster={poster || undefined}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      {caption && (
        <p className="mt-3 text-sm text-gray-400 text-center">{caption}</p>
      )}
    </div>
  );
}
