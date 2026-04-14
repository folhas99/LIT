"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Save, Upload, X, GripVertical, Star } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Photo = {
  id?: string;
  url: string;
  alt: string;
  order: number;
  blurDataUrl?: string | null;
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
  const [altEditing, setAltEditing] = useState<number | null>(null);

  const isEdit = !!initialData?.id;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const uploadFile = async (file: File): Promise<{ url: string; blurDataUrl: string | null } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url ? { url: data.url, blurDataUrl: data.blurDataUrl ?? null } : null;
    } catch {
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const newPhotos: Photo[] = [];
    for (const file of acceptedFiles) {
      const uploaded = await uploadFile(file);
      if (uploaded) {
        newPhotos.push({
          url: uploaded.url,
          blurDataUrl: uploaded.blurDataUrl,
          alt: "",
          order: form.photos.length + newPhotos.length,
        });
      }
    }
    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
      coverImage: prev.coverImage || newPhotos[0]?.url || prev.coverImage,
    }));
    setUploading(false);
    if (newPhotos.length > 0) {
      toast.success(`${newPhotos.length} foto${newPhotos.length === 1 ? "" : "s"} carregada${newPhotos.length === 1 ? "" : "s"}`);
    }
  }, [form.photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removePhoto = async (index: number) => {
    const photo = form.photos[index];
    if (photo.id) {
      if (!confirm("Eliminar esta foto permanentemente?")) return;
      await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
    }
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      coverImage: prev.coverImage === photo.url ? (prev.photos.find((_, i) => i !== index)?.url || "") : prev.coverImage,
    }));
  };

  const setCover = (url: string) => {
    setForm((prev) => ({ ...prev, coverImage: url }));
  };

  const updateAlt = (index: number, alt: string) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.map((p, i) => (i === index ? { ...p, alt } : p)),
    }));
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = form.photos.findIndex((p) => (p.id || p.url) === active.id);
    const newIndex = form.photos.findIndex((p) => (p.id || p.url) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(form.photos, oldIndex, newIndex).map((p, i) => ({
      ...p,
      order: i,
    }));
    setForm((prev) => ({ ...prev, photos: reordered }));

    // Persist order for existing photos (with id)
    const withIds = reordered.filter((p) => p.id);
    if (withIds.length > 0) {
      await Promise.allSettled(
        withIds.map((p) =>
          fetch(`/api/photos/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: p.order }),
          })
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Alt text enforcement — warn if any photo lacks alt
    const missingAlt = form.photos.filter((p) => !p.alt.trim()).length;
    if (missingAlt > 0) {
      const ok = confirm(
        `${missingAlt} foto(s) sem texto alternativo. O texto alternativo ajuda na acessibilidade e SEO. Continuar mesmo assim?`
      );
      if (!ok) return;
    }

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
        // Update alt text for existing photos
        const withIds = form.photos.filter((p) => p.id);
        await Promise.allSettled(
          withIds.map((p) =>
            fetch(`/api/photos/${p.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ alt: p.alt, order: p.order }),
            })
          )
        );
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
        .map((p) => ({ url: p.url, alt: p.alt || null, blurDataUrl: p.blurDataUrl ?? null, galleryId }));

      if (newPhotos.length > 0) {
        await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos: newPhotos }),
        });
      }

      toast.success(isEdit ? "Álbum atualizado" : "Álbum criado");
      router.push("/admin/galeria");
      router.refresh();
    } catch {
      toast.error("Erro ao guardar galeria");
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

      {/* Photo grid with drag-drop */}
      {form.photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">
              Arrasta para reordenar • Clica na estrela para definir a capa
            </p>
            {form.photos.some((p) => !p.alt.trim()) && (
              <p className="text-xs text-yellow-400">
                {form.photos.filter((p) => !p.alt.trim()).length} sem alt
              </p>
            )}
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={form.photos.map((p) => p.id || p.url)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {form.photos.map((photo, i) => (
                  <SortablePhoto
                    key={photo.id || photo.url}
                    id={photo.id || photo.url}
                    photo={photo}
                    isCover={form.coverImage === photo.url}
                    onRemove={() => removePhoto(i)}
                    onSetCover={() => setCover(photo.url)}
                    onEditAlt={() => setAltEditing(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Alt text modal */}
      {altEditing !== null && form.photos[altEditing] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setAltEditing(null)}
        >
          <div
            className="bg-jungle-900 border border-jungle-700/50 rounded-sm p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-3">Texto alternativo</h3>
            <div className="relative aspect-video bg-jungle-800 rounded-sm overflow-hidden mb-3">
              <Image
                src={form.photos[altEditing].url}
                alt=""
                fill
                className="object-cover"
                sizes="500px"
              />
            </div>
            <textarea
              autoFocus
              value={form.photos[altEditing].alt}
              onChange={(e) => updateAlt(altEditing, e.target.value)}
              placeholder="Ex.: Pessoas a dançar na pista principal"
              rows={3}
              className="w-full px-4 py-2 bg-jungle-950 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Descreve a foto para leitores de ecrã e SEO.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setAltEditing(null)}
                className="px-4 py-2 text-gray-300 hover:text-white text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
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

function SortablePhoto({
  id,
  photo,
  isCover,
  onRemove,
  onSetCover,
  onEditAlt,
}: {
  id: string;
  photo: Photo;
  isCover: boolean;
  onRemove: () => void;
  onSetCover: () => void;
  onEditAlt: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square bg-jungle-800 rounded-sm overflow-hidden"
    >
      <Image src={photo.url} alt={photo.alt} fill className="object-cover" sizes="150px" />

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-jungle-900/80 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        title="Arrastar"
      >
        <GripVertical size={12} />
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remover"
      >
        <X size={12} />
      </button>

      {/* Set cover */}
      <button
        type="button"
        onClick={onSetCover}
        className={`absolute bottom-1 right-1 p-1 rounded-full transition-opacity ${
          isCover ? "bg-yellow-400 text-jungle-950 opacity-100" : "bg-jungle-900/80 text-white opacity-0 group-hover:opacity-100"
        }`}
        title={isCover ? "Capa atual" : "Definir como capa"}
      >
        <Star size={12} fill={isCover ? "currentColor" : "none"} />
      </button>

      {/* Alt text indicator */}
      <button
        type="button"
        onClick={onEditAlt}
        className={`absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] rounded-sm transition-opacity ${
          photo.alt.trim()
            ? "bg-jungle-600/80 text-white opacity-0 group-hover:opacity-100"
            : "bg-yellow-400/90 text-jungle-950 opacity-100"
        }`}
        title={photo.alt.trim() ? `Alt: ${photo.alt}` : "Adicionar texto alternativo"}
      >
        {photo.alt.trim() ? "Alt" : "Sem alt"}
      </button>
    </div>
  );
}
