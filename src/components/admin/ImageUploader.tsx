"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export default function ImageUploader({
  value,
  onChange,
  label,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError("");
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao enviar imagem");
        }

        const data = await res.json();
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    } else {
      setError("Apenas ficheiros de imagem.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange("");
    setError("");
  };

  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      )}

      {value ? (
        <div className="relative group rounded-sm overflow-hidden border border-jungle-700/50 bg-jungle-900">
          <div className="relative w-full h-40">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <div className="absolute inset-0 bg-jungle-950/0 group-hover:bg-jungle-950/60 transition-colors duration-200 flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white text-sm rounded-sm"
            >
              <X size={14} />
              Remover
            </button>
          </div>
          <div className="px-3 py-2 text-xs text-gray-500 truncate border-t border-jungle-700/30">
            {value}
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-sm cursor-pointer transition-all duration-200",
            dragOver
              ? "border-jungle-400 bg-jungle-800/50"
              : "border-jungle-700/50 bg-jungle-900/50 hover:border-jungle-600 hover:bg-jungle-900"
          )}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="text-jungle-400 animate-spin" />
              <span className="text-sm text-gray-400">A enviar...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-jungle-800 flex items-center justify-center">
                {dragOver ? (
                  <ImageIcon size={22} className="text-jungle-400" />
                ) : (
                  <Upload size={22} className="text-gray-500" />
                )}
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-300">
                  Clica ou arrasta uma imagem
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, WebP, GIF (max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
