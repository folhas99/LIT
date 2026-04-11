"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload } from "lucide-react";
import Image from "next/image";

type EventFormData = {
  id?: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  image: string;
  lineup: string;
  eventType: string;
  featured: boolean;
  published: boolean;
};

const defaultForm: EventFormData = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  image: "",
  lineup: "",
  eventType: "",
  featured: false,
  published: true,
};

export default function EventForm({
  initialData,
}: {
  initialData?: EventFormData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EventFormData>(initialData || defaultForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isEdit = !!initialData?.id;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setForm({ ...form, image: data.url });
    } catch {
      alert("Erro ao fazer upload da imagem");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = isEdit ? `/api/events/${initialData!.id}` : "/api/events";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          date: new Date(form.date).toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
          image: form.image || null,
          lineup: form.lineup || null,
          eventType: form.eventType || null,
          featured: form.featured,
          published: form.published,
        }),
      });

      if (!res.ok) throw new Error("Erro ao guardar");
      router.push("/admin/eventos");
      router.refresh();
    } catch {
      alert("Erro ao guardar evento");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Título *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors"
        />
      </div>

      {/* Date + End Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Data *</label>
          <input
            type="datetime-local"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Data Fim</label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors"
          />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Tipo de Evento</label>
        <select
          value={form.eventType}
          onChange={(e) => setForm({ ...form, eventType: e.target.value })}
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors"
        >
          <option value="">Sem tipo</option>
          <option value="wednesday">Quarta</option>
          <option value="thursday">Quinta</option>
          <option value="friday">Sexta</option>
          <option value="saturday">Sábado</option>
          <option value="special">Especial</option>
        </select>
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Imagem</label>
        {form.image && (
          <div className="relative w-full aspect-video rounded-sm overflow-hidden mb-3 bg-jungle-800">
            <Image src={form.image} alt="Preview" fill className="object-cover" sizes="672px" />
          </div>
        )}
        <label className="flex items-center gap-2 px-4 py-2.5 bg-jungle-800 hover:bg-jungle-700 border border-jungle-700/50 rounded-sm text-gray-300 text-sm cursor-pointer transition-colors">
          <Upload size={16} />
          {uploading ? "A carregar..." : "Escolher imagem"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        {form.image && (
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full mt-2 px-4 py-2 bg-jungle-900 border border-jungle-700/50 rounded-sm text-gray-400 text-xs focus:outline-none"
            placeholder="Ou cola um URL de imagem"
          />
        )}
      </div>

      {/* Lineup */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Lineup</label>
        <textarea
          rows={3}
          value={form.lineup}
          onChange={(e) => setForm({ ...form, lineup: e.target.value })}
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors resize-none"
          placeholder="DJ 1, DJ 2..."
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Descrição (HTML)</label>
        <textarea
          rows={6}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 transition-colors resize-none font-mono text-xs"
          placeholder="<p>Descrição do evento...</p>"
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="w-4 h-4 rounded accent-jungle-500"
          />
          <span className="text-gray-300 text-sm">Publicado</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="w-4 h-4 rounded accent-jungle-500"
          />
          <span className="text-gray-300 text-sm">Destaque</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
      >
        <Save size={18} />
        {saving ? "A guardar..." : isEdit ? "Guardar Alterações" : "Criar Evento"}
      </button>
    </form>
  );
}
