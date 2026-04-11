"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  slug: string;
  date: string;
  eventType: string | null;
  published: boolean;
  featured: boolean;
};

export default function AdminEventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Tens a certeza que queres eliminar este evento?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Eventos</h1>
        <Link
          href="/admin/eventos/novo"
          className="flex items-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold rounded-sm transition-colors"
        >
          <Plus size={18} /> Novo Evento
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">Nenhum evento criado.</p>
      ) : (
        <div className="bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jungle-700/30">
                <th className="text-left p-4 text-gray-400 font-medium">Título</th>
                <th className="text-left p-4 text-gray-400 font-medium hidden sm:table-cell">Data</th>
                <th className="text-left p-4 text-gray-400 font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left p-4 text-gray-400 font-medium">Estado</th>
                <th className="text-right p-4 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-jungle-700/20 hover:bg-jungle-800/30">
                  <td className="p-4 text-white">{event.title}</td>
                  <td className="p-4 text-gray-400 hidden sm:table-cell">
                    {new Date(event.date).toLocaleDateString("pt-PT")}
                  </td>
                  <td className="p-4 text-gray-400 hidden md:table-cell">
                    {event.eventType || "—"}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium ${event.published ? "text-green-400" : "text-gray-500"}`}>
                      {event.published ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(event.id, event.published)}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors"
                        title={event.published ? "Despublicar" : "Publicar"}
                      >
                        {event.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link
                        href={`/admin/eventos/${event.id}`}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
