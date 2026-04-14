"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="p-8">
      <div className="max-w-md">
        <AlertTriangle size={36} className="text-yellow-400 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Erro no painel admin</h2>
        <p className="text-gray-400 text-sm mb-4">{error.message || "Ocorreu um erro inesperado."}</p>
        <button
          onClick={reset}
          className="px-5 py-2 bg-jungle-600 hover:bg-jungle-500 text-white text-sm rounded-sm transition-colors"
        >
          Tentar novamente
        </button>
        {error.digest && (
          <p className="mt-4 text-xs text-gray-600">ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
