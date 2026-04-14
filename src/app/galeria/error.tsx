"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gallery error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <AlertTriangle size={40} className="mx-auto text-yellow-400 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Não foi possível carregar a galeria</h2>
        <button
          onClick={reset}
          className="mt-4 px-5 py-2 bg-jungle-600 hover:bg-jungle-500 text-white text-sm rounded-sm transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
