"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Pencil, Type as TypeIcon, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Font = {
  id: string;
  name: string;
  family: string;
  originalName: string;
  filename: string;
  url: string;
  format: string;
  size: number;
  weight: number;
  style: string;
  display: string;
  createdAt: string;
};

const PREVIEW_TEXT = "AaBbCc 123 — Lit Coimbra. The quick brown fox jumps over the lazy dog.";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FontLibraryPage() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Font>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const reload = async () => {
    try {
      const res = await fetch("/api/fonts", { cache: "no-store" });
      if (res.ok) setFonts(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/fonts", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Falha no upload");
      }
      await reload();
      // Bust the stylesheet cache by reloading the link element.
      const existing = document.querySelector('link[href^="/api/fonts/stylesheet.css"]') as HTMLLinkElement | null;
      if (existing) {
        existing.href = `/api/fonts/stylesheet.css?t=${Date.now()}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) upload(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  };

  const startEdit = (f: Font) => {
    setEditingId(f.id);
    setDraft({ name: f.name, family: f.family, weight: f.weight, style: f.style, display: f.display });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/fonts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Falha ao actualizar");
      }
      await reload();
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Apagar a fonte "${name}"? Esta acção não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/fonts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao apagar");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Fontes</h1>
          <p className="text-gray-400">
            Carrega fontes personalizadas (.woff2, .woff, .ttf, .otf) e usa-as no editor de tema.
          </p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "mb-8 p-8 border-2 border-dashed rounded-sm text-center transition-colors",
          dragOver
            ? "border-jungle-400 bg-jungle-900/50"
            : "border-jungle-700/40 bg-jungle-900/30 hover:border-jungle-600",
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf,application/x-font-ttf,application/x-font-otf"
          onChange={onPickFile}
          className="hidden"
        />
        <Upload size={36} className="mx-auto mb-3 text-jungle-400" />
        <p className="text-white font-semibold">Arrasta um ficheiro de fonte para aqui</p>
        <p className="text-sm text-gray-500 mt-1">ou</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-3 px-4 py-2 bg-jungle-700 hover:bg-jungle-600 text-white text-sm font-semibold rounded-sm inline-flex items-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> A carregar...
            </>
          ) : (
            <>
              <Upload size={14} /> Escolher ficheiro
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Formatos suportados: woff2 (recomendado), woff, ttf, otf · max 5 MB
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-950/40 border border-red-800/40 rounded-sm text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Font list */}
      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : fonts.length === 0 ? (
        <div className="p-12 text-center bg-jungle-900/30 border border-jungle-700/30 rounded-sm">
          <TypeIcon size={36} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">Ainda não há fontes carregadas.</p>
          <p className="text-sm text-gray-500 mt-1">Carrega a primeira para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fonts.map((f) => {
            const isEditing = editingId === f.id;
            return (
              <div
                key={f.id}
                className="p-5 bg-jungle-900/40 border border-jungle-700/30 rounded-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        value={String(draft.name ?? "")}
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white text-base font-semibold"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-white truncate">{f.name}</h3>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {f.originalName} · {f.format.toUpperCase()} · {formatBytes(f.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(f.id)}
                          title="Guardar"
                          className="p-2 text-green-400 hover:bg-green-950/40 rounded-sm"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          title="Cancelar"
                          className="p-2 text-gray-400 hover:bg-jungle-800 rounded-sm"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(f)}
                          title="Editar"
                          className="p-2 text-gray-400 hover:text-white hover:bg-jungle-800 rounded-sm"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => remove(f.id, f.name)}
                          title="Apagar"
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <label className="text-xs">
                      <span className="block text-gray-400 mb-1">Família CSS</span>
                      <input
                        value={String(draft.family ?? "")}
                        onChange={(e) => setDraft((d) => ({ ...d, family: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white"
                      />
                    </label>
                    <label className="text-xs">
                      <span className="block text-gray-400 mb-1">Peso (100-900)</span>
                      <input
                        type="number"
                        min={100}
                        max={900}
                        step={100}
                        value={Number(draft.weight ?? 400)}
                        onChange={(e) => setDraft((d) => ({ ...d, weight: Number(e.target.value) }))}
                        className="w-full px-2 py-1.5 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white"
                      />
                    </label>
                    <label className="text-xs">
                      <span className="block text-gray-400 mb-1">Estilo</span>
                      <select
                        value={String(draft.style ?? "normal")}
                        onChange={(e) => setDraft((d) => ({ ...d, style: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="italic">Itálico</option>
                      </select>
                    </label>
                    <label className="text-xs">
                      <span className="block text-gray-400 mb-1">font-display</span>
                      <select
                        value={String(draft.display ?? "swap")}
                        onChange={(e) => setDraft((d) => ({ ...d, display: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white"
                      >
                        <option value="swap">swap</option>
                        <option value="block">block</option>
                        <option value="fallback">fallback</option>
                        <option value="optional">optional</option>
                      </select>
                    </label>
                  </div>
                )}

                <div
                  className="px-4 py-3 bg-black/40 border border-jungle-700/20 rounded-sm text-white"
                  style={{
                    fontFamily: `"${f.family}", system-ui, sans-serif`,
                    fontWeight: f.weight,
                    fontStyle: f.style,
                    fontSize: "1.5rem",
                    lineHeight: 1.3,
                  }}
                >
                  {PREVIEW_TEXT}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>
                    <span className="text-gray-600">family-name:</span>{" "}
                    <code className="text-jungle-300">&quot;{f.family}&quot;</code>
                  </span>
                  <span>
                    <span className="text-gray-600">weight:</span> {f.weight}
                  </span>
                  <span>
                    <span className="text-gray-600">style:</span> {f.style}
                  </span>
                  <span>
                    <span className="text-gray-600">display:</span> {f.display}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
