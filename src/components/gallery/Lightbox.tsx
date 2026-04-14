"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download, Share2, Check } from "lucide-react";

type Photo = {
  id: string;
  url: string;
  alt: string | null;
  blurDataUrl?: string | null;
};

const SWIPE_THRESHOLD = 50; // px

export default function Lightbox({
  photos,
  initialIndex = 0,
  onClose,
}: {
  photos: Photo[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const handleDownload = useCallback(async (photo: Photo) => {
    try {
      const res = await fetch(photo.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const filename = photo.url.split("/").pop() || `foto-${photo.id}.jpg`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(photo.url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleShare = useCallback(async (photo: Photo) => {
    const absoluteUrl = photo.url.startsWith("http")
      ? photo.url
      : typeof window !== "undefined"
        ? `${window.location.origin}${photo.url}`
        : photo.url;
    const shareData = {
      title: "LIT Coimbra",
      text: photo.alt || "Foto — LIT Coimbra",
      url: absoluteUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(absoluteUrl);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2000);
      }
    } catch {
      // User cancelled or failed — no-op
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    setDragX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    // Only track horizontal movement
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragX(dx);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStart.current.x;
    const dy = endY - touchStart.current.y;
    touchStart.current = null;
    setDragX(0);

    // Horizontal swipe → navigate
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
      return;
    }
    // Vertical swipe down → close
    if (dy > SWIPE_THRESHOLD * 2 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
    }
  };

  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-jungle-950/95 flex items-center justify-center select-none"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"
        aria-label="Fechar"
      >
        <X size={28} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/50 text-sm z-50">
        {index + 1} / {photos.length}
      </div>

      {/* Actions */}
      <div className="absolute top-4 right-16 flex items-center gap-1 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare(photo);
          }}
          className="text-white/70 hover:text-white p-2 rounded-sm hover:bg-white/10 transition-colors relative"
          aria-label="Partilhar"
          title="Partilhar"
        >
          {shareStatus === "copied" ? <Check size={22} /> : <Share2 size={22} />}
          {shareStatus === "copied" && (
            <span className="absolute -bottom-8 right-0 text-xs bg-jungle-900 text-white px-2 py-1 rounded-sm whitespace-nowrap">
              Link copiado
            </span>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(photo);
          }}
          className="text-white/70 hover:text-white p-2 rounded-sm hover:bg-white/10 transition-colors"
          aria-label="Download"
          title="Download"
        >
          <Download size={22} />
        </button>
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-2 md:left-6 text-white/50 hover:text-white z-50 p-2"
          aria-label="Anterior"
        >
          <ChevronLeft size={36} />
        </button>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[85vh] m-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: dragX ? `translateX(${dragX}px)` : undefined,
          transition: dragX ? "none" : "transform 0.2s ease-out",
        }}
      >
        <Image
          src={photo.url}
          alt={photo.alt || ""}
          fill
          className="object-contain"
          sizes="100vw"
          priority
          {...(photo.blurDataUrl
            ? { placeholder: "blur" as const, blurDataURL: photo.blurDataUrl }
            : {})}
        />
      </div>

      {/* Next */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-2 md:right-6 text-white/50 hover:text-white z-50 p-2"
          aria-label="Seguinte"
        >
          <ChevronRight size={36} />
        </button>
      )}

      {/* Mobile swipe hint */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs md:hidden pointer-events-none">
          Desliza para navegar
        </div>
      )}
    </div>
  );
}
