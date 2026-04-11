"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/gallery/Lightbox";

type Photo = {
  id: string;
  url: string;
  alt: string | null;
  order: number;
};

export default function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square overflow-hidden rounded-sm bg-jungle-800 cursor-pointer group"
          >
            <Image
              src={photo.url}
              alt={photo.alt || ""}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-jungle-950/0 group-hover:bg-jungle-950/30 transition-colors" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
