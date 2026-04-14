"use client";

import { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lng: number;
  label?: string;
  zoom?: number;
};

export default function ContactMap({ lat, lng, label, zoom = 16 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !ref.current) return;

      // Fix default marker icon paths (Next.js bundler strips the defaults).
      type IconDefaultProto = { _getIconUrl?: () => string };
      const proto = L.Icon.Default.prototype as unknown as IconDefaultProto;
      delete proto._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(ref.current, {
        center: [lat, lng],
        zoom,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      // Carto Dark Matter tile layer — fits the site theme
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      if (label) marker.bindPopup(label).openPopup();

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom, label]);

  return (
    <div className="relative rounded-sm overflow-hidden border border-jungle-700/40 bg-jungle-900/50">
      <div ref={ref} className="w-full h-64 md:h-80" aria-label="Mapa" />
      <div className="absolute top-2 right-2 z-[1000]">
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white bg-jungle-900/80 backdrop-blur-sm px-2 py-1 rounded-sm border border-jungle-700/50 hover:bg-jungle-800 transition-colors"
        >
          Abrir mapa
        </a>
      </div>
    </div>
  );
}
