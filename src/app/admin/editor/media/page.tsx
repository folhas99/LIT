"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Trash2,
  Copy,
  ImageIcon,
  Search,
  ArrowUpDown,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  HardDrive,
  FileImage,
} from "lucide-react";

type MediaFile = {
  filename: string;
  url: string;
  size: number;
  lastModified: number;
  type: string;
};

type SortOption = "newest" | "oldest" | "name" | "size";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    { name: string; status: "uploading" | "done" | "error"; error?: string }[]
  >([]);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    const progress = Array.from(fileList).map((f) => ({
      name: f.name,
      status: "uploading" as const,
    }));
    setUploadProgress(progress);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          setUploadProgress((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, status: "done" } : p))
          );
        } else {
          const err = await res.json();
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? { ...p, status: "error", error: err.error || "Erro" }
                : p
            )
          );
        }
      } catch {
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: "error", error: "Erro de rede" } : p
          )
        );
      }
    }

    setUploading(false);
    await fetchFiles();

    // Clear progress after 4 seconds
    setTimeout(() => setUploadProgress([]), 4000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: deleteTarget.filename }),
      });

      if (res.ok) {
        setFiles((prev) =>
          prev.filter((f) => f.filename !== deleteTarget.filename)
        );
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Filtering and sorting
  const filtered = files
    .filter((f) =>
      f.filename.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.lastModified - a.lastModified;
        case "oldest":
          return a.lastModified - b.lastModified;
        case "name":
          return a.filename.localeCompare(b.filename);
        case "size":
          return b.size - a.size;
        default:
          return 0;
      }
    });

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">
        Biblioteca de Media
      </h1>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <FileImage size={16} />
          <span>
            {files.length} {files.length === 1 ? "ficheiro" : "ficheiros"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <HardDrive size={16} />
          <span>{formatFileSize(totalSize)} utilizados</span>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative mb-8 border-2 border-dashed rounded-sm p-8 text-center transition-colors ${
          dragOver
            ? "border-jungle-400 bg-jungle-900/70"
            : "border-jungle-700/50 bg-jungle-900/30 hover:border-jungle-600/70"
        }`}
      >
        <Upload
          size={40}
          className="mx-auto mb-3 text-gray-500"
        />
        <p className="text-gray-300 mb-1 text-sm">
          Arraste e solte imagens aqui
        </p>
        <p className="text-gray-500 text-xs mb-4">
          JPEG, PNG, WebP, GIF, AVIF - Max 10MB
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white text-sm font-semibold rounded-sm transition-colors"
        >
          <Upload size={16} />
          {uploading ? "A carregar..." : "Carregar Imagens"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mb-6 space-y-2">
          {uploadProgress.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm text-sm"
            >
              {item.status === "uploading" && (
                <Loader2 size={14} className="text-jungle-400 animate-spin" />
              )}
              {item.status === "done" && (
                <CheckCircle size={14} className="text-green-400" />
              )}
              {item.status === "error" && (
                <AlertTriangle size={14} className="text-red-400" />
              )}
              <span className="text-gray-300 truncate flex-1">
                {item.name}
              </span>
              {item.status === "uploading" && (
                <span className="text-gray-500 text-xs">A carregar...</span>
              )}
              {item.status === "done" && (
                <span className="text-green-400 text-xs">Concluido</span>
              )}
              {item.status === "error" && (
                <span className="text-red-400 text-xs">{item.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors placeholder:text-gray-600"
          />
        </div>
        <div className="relative">
          <ArrowUpDown
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="pl-8 pr-8 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="name">Nome</option>
            <option value="size">Tamanho</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : filtered.length === 0 && search ? (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-sm">
            Nenhum ficheiro encontrado para &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-jungle-700/40 rounded-sm">
          <ImageIcon size={56} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-1">Sem ficheiros na biblioteca</p>
          <p className="text-gray-600 text-sm">
            Carregue imagens para comecar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((file) => (
            <div
              key={file.filename}
              className="group relative bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative aspect-square bg-jungle-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-jungle-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="p-2 bg-jungle-700/80 hover:bg-jungle-600 text-white rounded-sm transition-colors"
                    title="Copiar URL"
                  >
                    {copied === file.url ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(file)}
                    className="p-2 bg-red-900/80 hover:bg-red-800 text-white rounded-sm transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p
                  className="text-gray-300 text-xs truncate"
                  title={file.filename}
                >
                  {file.filename}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-500 text-[11px]">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    {formatDate(file.lastModified)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-jungle-950/80">
          <div className="bg-jungle-900 border border-jungle-700/50 rounded-sm p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-900/30 rounded-sm">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-semibold">Eliminar ficheiro</h3>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              Tem a certeza que deseja eliminar este ficheiro?
            </p>
            <p className="text-gray-300 text-sm font-mono bg-jungle-800/50 px-3 py-2 rounded-sm mb-6 truncate">
              {deleteTarget.filename}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-sm transition-colors"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {deleting ? "A eliminar..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
