"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Algo correu mal</h1>
        <p className="text-gray-400 text-sm mb-6">
          Encontrámos um problema ao carregar esta página. Tenta novamente.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold tracking-wider uppercase rounded-sm transition-colors"
        >
          Tentar novamente
        </button>
        {error.digest && (
          <p className="mt-6 text-xs text-gray-600">ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
