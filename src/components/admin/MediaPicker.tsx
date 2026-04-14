"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  Upload,
  Search,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ImageIcon,
  Trash2,
} from "lucide-react";

/**
 * MediaPicker — reusable modal to choose one or more images from the
 * /uploads library. Supports inline upload via /api/upload and optional
 * multi-select. On confirm, returns the selected url(s).
 */

type MediaFile = {
  filename: string;
  url: string;
  size: number;
  lastModified: number;
  type: string;
};

type BaseProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
};

type SingleProps = BaseProps & {
  multiple?: false;
  onSelect: (url: string) => void;
};

type MultiProps = BaseProps & {
  multiple: true;
  onSelect: (urls: string[]) => void;
  /** Images already in the consumer's list — shown as pre-selected. */
  initialSelected?: string[];
};

type Props = SingleProps | MultiProps;

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPicker(props: Props) {
  const { open, onClose, title } = props;
  const multiple = props.multiple === true;
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(() =>
    props.multiple && props.initialSelected ? [...props.initialSelected] : []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = (await res.json()) as MediaFile[];
        setFiles(data);
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset + refetch when opened
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setUploadError(null);
    if (props.multiple && props.initialSelected) {
      setSelected([...props.initialSelected]);
    } else {
      setSelected([]);
    }
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const uploaded: string[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const data = (await res.json()) as { url?: string };
          if (data.url) uploaded.push(data.url);
        } else {
          const err = await res.json().catch(() => ({ error: "Erro" }));
          setUploadError(err.error || "Erro no upload");
        }
      } catch {
        setUploadError("Erro de rede");
      }
    }
    setUploading(false);
    await fetchFiles();
    // Auto-select the freshly uploaded ones
    if (uploaded.length) {
      if (multiple) {
        setSelected((prev) => Array.from(new Set([...prev, ...uploaded])));
      } else {
        // single: immediately confirm
        (props as SingleProps).onSelect(uploaded[0]);
        onClose();
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggle = (url: string) => {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      (props as SingleProps).onSelect(url);
      onClose();
    }
  };

  const confirm = () => {
    if (multiple) {
      (props as MultiProps).onSelect(selected);
      onClose();
    }
  };

  const filtered = files
    .filter((f) => f.filename.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.lastModified - a.lastModified);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-jungle-950/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-jungle-900 border border-jungle-700/50 rounded-sm shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-jungle-700/50">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-jungle-400" />
            <h3 className="text-white font-semibold">
              {title || (multiple ? "Escolher imagens" : "Escolher imagem")}
            </h3>
            {multiple && selected.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-jungle-700/60 text-jungle-200 rounded-sm">
                {selected.length} selecionada{selected.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: upload + search */}
        <div className="px-5 py-3 border-b border-jungle-700/30 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white text-sm font-semibold rounded-sm transition-colors"
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {uploading ? "A carregar..." : "Carregar"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors placeholder:text-gray-600"
            />
          </div>
        </div>

        {uploadError && (
          <div className="px-5 py-2 bg-red-950/40 border-b border-red-900/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle size={14} /> {uploadError}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 size={18} className="animate-spin mr-2" />
              A carregar...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon size={48} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm">
                {search
                  ? `Sem resultados para "${search}"`
                  : "Sem ficheiros — carrega imagens para começar."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((f) => {
                const isSelected = selected.includes(f.url);
                return (
                  <button
                    key={f.filename}
                    type="button"
                    onClick={() => toggle(f.url)}
                    className={`group relative aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-jungle-400 ring-2 ring-jungle-500/40"
                        : "border-jungle-700/30 hover:border-jungle-500/60"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt={f.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-jungle-500 text-white rounded-full p-0.5">
                        <CheckCircle size={16} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-jungle-950/90 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-gray-200 truncate text-left">
                        {f.filename}
                      </p>
                      <p className="text-[10px] text-gray-400 text-left">
                        {fmtSize(f.size)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-jungle-700/50 bg-jungle-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white text-sm transition-colors"
          >
            Cancelar
          </button>
          {multiple && (
            <button
              onClick={confirm}
              disabled={selected.length === 0}
              className="px-4 py-2 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-sm transition-colors"
            >
              Adicionar {selected.length > 0 ? `(${selected.length})` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Helper field: MediaField (single) ---------------- */

export function MediaField({
  label,
  value,
  onChange,
  placeholder,
  allowUrl = true,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  /** If true (default), shows also a text input for typing/pasting a URL. */
  allowUrl?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      <div className="flex gap-2">
        {value ? (
          <div className="relative h-11 w-11 flex-shrink-0 rounded-sm overflow-hidden border border-jungle-700/40 bg-jungle-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        ) : null}
        {allowUrl ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "URL ou escolher da biblioteca..."}
            className="flex-1 px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
          />
        ) : (
          <div className="flex-1 px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-gray-300 text-sm truncate">
            {value || <span className="text-gray-600">{placeholder || "Sem imagem"}</span>}
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-3 py-2.5 bg-jungle-700/60 hover:bg-jungle-600 border border-jungle-700/50 text-white text-sm rounded-sm transition-colors inline-flex items-center gap-1.5"
        >
          <ImageIcon size={14} /> Biblioteca
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-2.5 py-2.5 text-gray-500 hover:text-red-400 transition-colors"
            title="Remover"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
}
