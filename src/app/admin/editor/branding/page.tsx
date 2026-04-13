"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Globe } from "lucide-react";
import Image from "next/image";

export default function BrandingPage() {
  const [favicon, setFavicon] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/favicon")
      .then((r) => r.json())
      .then((data) => {
        setFavicon(data.favicon || "");
        setLogo(data.logo || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleUpload = async (file: File, type: "favicon" | "logo") => {
    setUploading(type);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);

      const res = await fetch("/api/favicon", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (type === "favicon") setFavicon(data.url);
      else setLogo(data.url);

      setToast({ type: "success", message: `${type === "favicon" ? "Favicon" : "Logo"} atualizado com sucesso!` });
    } catch {
      setToast({ type: "error", message: "Erro ao fazer upload." });
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <p className="text-gray-500">A carregar...</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Branding & Icones</h1>
        <p className="text-gray-400 text-sm mt-1">
          Personaliza o favicon, logo e identidade visual do site.
        </p>
      </div>

      {toast && (
        <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-sm text-sm ${
          toast.type === "success"
            ? "bg-green-900/30 border border-green-700/30 text-green-400"
            : "bg-red-900/30 border border-red-700/30 text-red-400"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Favicon */}
        <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-jungle-400" />
            <h2 className="text-lg font-semibold text-white">Favicon</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            O icone que aparece no separador do browser. Recomendado: 32x32px ou 64x64px.
          </p>

          {favicon && (
            <div className="mb-4 flex items-center gap-4 p-3 bg-jungle-950 rounded-sm border border-jungle-700/20">
              <div className="w-16 h-16 bg-jungle-800 rounded-sm flex items-center justify-center overflow-hidden">
                <Image src={favicon} alt="Favicon" width={64} height={64} className="object-contain" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{favicon}</p>
                <p className="text-gray-500 text-xs">Favicon atual</p>
              </div>
            </div>
          )}

          <input
            ref={faviconRef}
            type="file"
            accept=".ico,.png,.svg,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file, "favicon");
            }}
          />

          <button
            onClick={() => faviconRef.current?.click()}
            disabled={uploading === "favicon"}
            className="w-full flex flex-col items-center gap-2 p-8 border-2 border-dashed border-jungle-700/50 rounded-sm hover:border-jungle-500/50 hover:bg-jungle-900/30 transition-colors cursor-pointer"
          >
            <Upload size={24} className="text-jungle-400" />
            <span className="text-gray-300 text-sm">
              {uploading === "favicon" ? "A carregar..." : "Clica para escolher favicon"}
            </span>
            <span className="text-gray-500 text-xs">ICO, PNG, SVG (max 1MB)</span>
          </button>
        </div>

        {/* Logo */}
        <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon size={20} className="text-jungle-400" />
            <h2 className="text-lg font-semibold text-white">Logo</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            O logo principal do site. Aparece no header e outras areas. Recomendado: PNG ou SVG transparente.
          </p>

          {logo && (
            <div className="mb-4 flex items-center gap-4 p-3 bg-jungle-950 rounded-sm border border-jungle-700/20">
              <div className="w-32 h-16 bg-jungle-800 rounded-sm flex items-center justify-center overflow-hidden">
                <Image src={logo} alt="Logo" width={128} height={64} className="object-contain" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{logo}</p>
                <p className="text-gray-500 text-xs">Logo atual</p>
              </div>
            </div>
          )}

          <input
            ref={logoRef}
            type="file"
            accept=".png,.svg,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file, "logo");
            }}
          />

          <button
            onClick={() => logoRef.current?.click()}
            disabled={uploading === "logo"}
            className="w-full flex flex-col items-center gap-2 p-8 border-2 border-dashed border-jungle-700/50 rounded-sm hover:border-jungle-500/50 hover:bg-jungle-900/30 transition-colors cursor-pointer"
          >
            <Upload size={24} className="text-jungle-400" />
            <span className="text-gray-300 text-sm">
              {uploading === "logo" ? "A carregar..." : "Clica para escolher logo"}
            </span>
            <span className="text-gray-500 text-xs">PNG, SVG, JPG, WebP (max 5MB)</span>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Pre-visualizacao</h2>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="w-8 h-8 bg-jungle-800 rounded-sm flex items-center justify-center overflow-hidden mx-auto mb-2">
              {favicon ? (
                <Image src={favicon} alt="Favicon" width={32} height={32} className="object-contain" unoptimized />
              ) : (
                <Globe size={16} className="text-gray-500" />
              )}
            </div>
            <span className="text-gray-500 text-xs">Tab do browser</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-jungle-950 rounded-sm border border-jungle-700/20">
            {logo ? (
              <Image src={logo} alt="Logo" width={80} height={32} className="object-contain" unoptimized />
            ) : (
              <span className="text-xl font-bold text-white tracking-wider">LIT <span className="text-jungle-400 text-sm">Coimbra</span></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
