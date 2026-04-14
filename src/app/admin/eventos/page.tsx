"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, List, Calendar, ChevronLeft, ChevronRight, Copy, CheckSquare, Square, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

type Event = {
  id: string;
  title: string;
  slug: string;
  date: string;
  eventType: string | null;
  published: boolean;
  featured: boolean;
};

type View = "list" | "calendar";

export default function AdminEventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

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
    toast.success(!published ? "Evento publicado" : "Evento despublicado");
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Tens a certeza que queres eliminar este evento?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    toast.success("Evento eliminado");
    fetchEvents();
  };

  const duplicateEvent = async (id: string) => {
    const res = await fetch(`/api/events/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      toast.success("Evento duplicado — +1 semana, como rascunho");
      fetchEvents();
    } else {
      toast.error("Falhou a duplicar o evento");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === events.length) setSelected(new Set());
    else setSelected(new Set(events.map((e) => e.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const bulkUpdate = async (published: boolean) => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/events/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published }),
        })
      )
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    toast.success(`${ok} ${ok === 1 ? "evento" : "eventos"} ${published ? "publicado" : "despublicado"}${ok === 1 ? "" : "s"}`);
    clearSelection();
    await fetchEvents();
    setBulkBusy(false);
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Eliminar ${selected.size} evento(s)? Esta ação é irreversível.`)) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map((id) => fetch(`/api/events/${id}`, { method: "DELETE" }))
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    toast.success(`${ok} ${ok === 1 ? "evento eliminado" : "eventos eliminados"}`);
    clearSelection();
    await fetchEvents();
    setBulkBusy(false);
  };

  const exportCsv = () => {
    const rows = events.map((e) => [
      e.title,
      new Date(e.date).toISOString(),
      e.eventType || "",
      e.published ? "publicado" : "rascunho",
      e.featured ? "destaque" : "",
      e.slug,
    ]);
    const header = ["Titulo", "Data", "Tipo", "Estado", "Destaque", "Slug"];
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eventos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allSelected = events.length > 0 && selected.size === events.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Eventos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={events.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white bg-jungle-900/50 hover:bg-jungle-800/50 border border-jungle-700/30 rounded-sm transition-colors disabled:opacity-40"
            title="Exportar CSV"
          >
            <Download size={16} /> CSV
          </button>
          <div className="flex bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm transition-colors",
                view === "list" ? "bg-jungle-700 text-white" : "text-gray-400 hover:text-white"
              )}
              aria-pressed={view === "list"}
            >
              <List size={16} /> Lista
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm transition-colors",
                view === "calendar" ? "bg-jungle-700 text-white" : "text-gray-400 hover:text-white"
              )}
              aria-pressed={view === "calendar"}
            >
              <Calendar size={16} /> Calendário
            </button>
          </div>
          <Link
            href="/admin/eventos/novo"
            className="flex items-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold rounded-sm transition-colors"
          >
            <Plus size={18} /> Novo Evento
          </Link>
        </div>
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && view === "list" && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-jungle-800/60 border border-jungle-600/40 rounded-sm">
          <span className="text-sm text-white">
            {selected.size} selecionado{selected.size === 1 ? "" : "s"}
          </span>
          <div className="h-4 w-px bg-jungle-600 mx-2" />
          <button
            disabled={bulkBusy}
            onClick={() => bulkUpdate(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-400 hover:text-white hover:bg-green-900/30 rounded-sm transition-colors disabled:opacity-40"
          >
            <Eye size={14} /> Publicar
          </button>
          <button
            disabled={bulkBusy}
            onClick={() => bulkUpdate(false)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-jungle-700 rounded-sm transition-colors disabled:opacity-40"
          >
            <EyeOff size={14} /> Despublicar
          </button>
          <button
            disabled={bulkBusy}
            onClick={bulkDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:text-white hover:bg-red-900/40 rounded-sm transition-colors disabled:opacity-40"
          >
            <Trash2 size={14} /> Eliminar
          </button>
          <button
            onClick={clearSelection}
            className="ml-auto text-xs text-gray-400 hover:text-white"
          >
            Limpar
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={6} />
      ) : view === "calendar" ? (
        <CalendarView events={events} />
      ) : events.length === 0 ? (
        <p className="text-gray-500">Nenhum evento criado.</p>
      ) : (
        <div className="bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jungle-700/30">
                <th className="p-4 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-white"
                    aria-label={allSelected ? "Desselecionar todos" : "Selecionar todos"}
                  >
                    {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="text-left p-4 text-gray-400 font-medium">Título</th>
                <th className="text-left p-4 text-gray-400 font-medium hidden sm:table-cell">Data</th>
                <th className="text-left p-4 text-gray-400 font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left p-4 text-gray-400 font-medium">Estado</th>
                <th className="text-right p-4 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className={cn(
                  "border-b border-jungle-700/20 hover:bg-jungle-800/30",
                  selected.has(event.id) && "bg-jungle-800/50"
                )}>
                  <td className="p-4">
                    <button
                      onClick={() => toggleSelect(event.id)}
                      className="text-gray-400 hover:text-white"
                      aria-label={selected.has(event.id) ? "Desselecionar" : "Selecionar"}
                    >
                      {selected.has(event.id) ? <CheckSquare size={16} className="text-neon-green" /> : <Square size={16} />}
                    </button>
                  </td>
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
                      <button
                        onClick={() => duplicateEvent(event.id)}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors"
                        title="Duplicar"
                      >
                        <Copy size={16} />
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

/* ============================================
   Calendar View
   ============================================ */

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function CalendarView({ events }: { events: Event[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const firstDay = new Date(cursor.year, cursor.month, 1);
  const lastDay = new Date(cursor.year, cursor.month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // JS: 0=Sun..6=Sat; We want Monday start: shift so Mon=0
  const startWeekday = (firstDay.getDay() + 6) % 7;

  // Build grid: array of cells (date or null)
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1;
    if (dayNum < 1 || dayNum > daysInMonth) cells.push(null);
    else cells.push(new Date(cursor.year, cursor.month, dayNum));
  }

  // Group events by YYYY-MM-DD
  const eventsByDay = new Map<string, Event[]>();
  for (const ev of events) {
    const d = new Date(ev.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const list = eventsByDay.get(key) || [];
    list.push(ev);
    eventsByDay.set(key, list);
  }

  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const prevMonth = () =>
    setCursor((c) =>
      c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }
    );
  const nextMonth = () =>
    setCursor((c) =>
      c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }
    );

  return (
    <div className="bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-jungle-700/30">
        <button
          onClick={prevMonth}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-white font-semibold">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Mês seguinte"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-jungle-700/30">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="p-2 text-center text-xs text-gray-500 uppercase tracking-wider">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={i} className="min-h-24 border-r border-b border-jungle-700/20 bg-jungle-950/30" />;
          }
          const key = `${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`;
          const dayEvents = eventsByDay.get(key) || [];
          const isToday = isSameDay(cell, today);
          return (
            <div
              key={i}
              className={cn(
                "min-h-24 border-r border-b border-jungle-700/20 p-1.5 flex flex-col gap-1",
                isToday ? "bg-jungle-800/40" : "bg-jungle-900/20"
              )}
            >
              <div
                className={cn(
                  "text-xs font-medium",
                  isToday ? "text-neon-green" : "text-gray-400"
                )}
              >
                {cell.getDate()}
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/admin/eventos/${ev.id}`}
                    className={cn(
                      "block px-1.5 py-0.5 text-[11px] rounded-sm truncate transition-colors",
                      ev.published
                        ? "bg-jungle-600/60 text-white hover:bg-jungle-500"
                        : "bg-jungle-800/60 text-gray-400 hover:bg-jungle-700"
                    )}
                    title={ev.title}
                  >
                    {ev.title}
                  </Link>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-gray-500 px-1">
                    +{dayEvents.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
