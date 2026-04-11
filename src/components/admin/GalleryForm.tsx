"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Save, Upload, X, GripVertical } from "lucide-react";
import Image from "next/image";

type Photo = {
  id?: string;
  url: string;
  alt: string;
  order: number;
};

type GalleryFormData = {
  id?: string;
  title: string;
  date: string;
  eventId: string;
  coverImage: string;
  published: boolean;
  photos: Photo[];
};

const defaultForm: GalleryFormData = {
  title: "",
  date: "",
  eventId: "",
  coverImage: "",
  published: true,
  photos: [],
};

export default function GalleryForm({
  initialData,
  events,
}: {
  initialData?: GalleryFormData;
  events?: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<GalleryFormData>(initialData || defaultForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isEdit = !!initialData?.id;

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const newPhotos: Photo[] = [];
    for (const file of acceptedFiles) {
      const url = await uploadFile(file);
      if (url) {
        newPhotos.push({ url, alt: "", order: form.photos.length + newPhotos.length });
      }
    }
    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
      coverImage: prev.coverImage || newPhotos[0]?.url || prev.coverImage,
    }));
    setUploading(false);
  }, [form.photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const galleryData = {
        title: form.title,
        date: new Date(form.date).toISOString(),
        eventId: form.eventId || null,
        coverImage: form.coverImage || null,
        published: form.published,
      };

      let galleryId = form.id;

      if (isEdit) {
        await fetch(`/api/galleries/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(galleryData),
        });
      } else {
        const res = await fetch("/api/galleries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(galleryData),
        });
        const data = await res.json();
        galleryId = data.id;
      }

      // Upload new photos (those without id)
      const newPhotos = form.photos
        .filter((p) => !p.id)
        .map((p) => ({ url: p.url, alt: p.alt || null, galleryId }));

      if (newPhotos.length > 0) {
        await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos: newPhotos }),
        });
      }

      router.push("/admin/galeria");
      router.refresh();
    } catch {
      alert("Erro ao guardar galeria");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Título *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors"
          placeholder="Nome do álbum"
        />
      </div>

      {/* Date + Event */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Data *</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Evento (opcional)</label>
          <select
            value={form.eventId}
            onChange={(e) => setForm({ ...form, eventId: e.target.value })}
            className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors"
          >
            <option value="">Sem evento</option>
            {events?.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Published */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
          className="w-4 h-4 rounded accent-jungle-500"
        />
        <span className="text-gray-300 text-sm">Publicado</span>
      </label>

      {/* Photos dropzone */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Fotos</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-jungle-500 bg-jungle-800/50"
              : "border-jungle-700/50 hover:border-jungle-600"
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={32} className="mx-auto text-gray-500 mb-2" />
          <p className="text-gray-400 text-sm">
            {uploading
              ? "A carregar..."
              : isDragActive
              ? "Larga as fotos aqui..."
              : "Arrasta fotos ou clica para selecionar"}
          </p>
        </div>
      </div>

      {/* Photo grid */}
      {form.photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {form.photos.map((photo, i) => (
            <div key={i} className="relative group aspect-square bg-jungle-800 rounded-sm overflow-hidden">
              <Image src={photo.url} alt={photo.alt} fill className="object-cover" sizes="150px" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              {form.coverImage === photo.url && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-jungle-600 text-white text-[10px] rounded-sm">
                  Capa
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
      >
        <Save size={18} />
        {saving ? "A guardar..." : isEdit ? "Guardar Alterações" : "Criar Álbum"}
      </button>
    </form>
  );
}
