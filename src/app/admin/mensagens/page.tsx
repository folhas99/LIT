"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
  CheckSquare,
  Square,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SkeletonTable } from "@/components/ui/Skeleton";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

type FilterType = "all" | "unread" | "read";

export default function MensagensPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id: string, read: boolean) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read } : m))
      );
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta mensagem?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/contact/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Mensagem eliminada");
    } catch {
      toast.error("Falhou a eliminar");
    } finally {
      setDeleting(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    // Auto mark as read when expanding
    const msg = messages.find((m) => m.id === id);
    if (msg && !msg.read) {
      toggleRead(id, true);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((m) => m.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const bulkMarkRead = async (read: boolean) => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/contact/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read }),
        })
      )
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    setMessages((prev) =>
      prev.map((m) => (selected.has(m.id) ? { ...m, read } : m))
    );
    toast.success(`${ok} mensagem${ok === 1 ? "" : "s"} marcada${ok === 1 ? "" : "s"} como ${read ? "lida" : "não lida"}${ok === 1 ? "" : "s"}`);
    clearSelection();
    setBulkBusy(false);
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Eliminar ${selected.size} mensagem(ns)?`)) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map((id) => fetch(`/api/contact/${id}`, { method: "DELETE" }))
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    setMessages((prev) => prev.filter((m) => !selected.has(m.id)));
    toast.success(`${ok} mensagem${ok === 1 ? "" : "s"} eliminada${ok === 1 ? "" : "s"}`);
    clearSelection();
    setBulkBusy(false);
  };

  const exportCsv = () => {
    const rows = messages.map((m) => [
      m.name,
      m.email,
      m.phone || "",
      m.subject || "",
      m.message.replace(/[\r\n]+/g, " "),
      m.read ? "lida" : "não lida",
      new Date(m.createdAt).toISOString(),
    ]);
    const header = ["Nome", "Email", "Telefone", "Assunto", "Mensagem", "Estado", "Data"];
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mensagens-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  if (loading) return <SkeletonTable rows={6} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Mensagens
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-jungle-600 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Mensagens recebidas pelo formulário de contacto.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={messages.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white bg-jungle-900/50 hover:bg-jungle-800/50 border border-jungle-700/30 rounded-sm transition-colors disabled:opacity-40"
        >
          <Download size={16} /> CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 text-sm rounded-sm transition-colors",
              filter === f
                ? "bg-jungle-700 text-white"
                : "bg-jungle-900/50 text-gray-400 hover:text-white hover:bg-jungle-800/50"
            )}
          >
            {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : "Lidas"}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 text-xs text-jungle-400">({unreadCount})</span>
            )}
          </button>
        ))}
        {filtered.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            {allSelected ? "Desselecionar todos" : "Selecionar todos"}
          </button>
        )}
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-jungle-800/60 border border-jungle-600/40 rounded-sm">
          <span className="text-sm text-white">
            {selected.size} selecionada{selected.size === 1 ? "" : "s"}
          </span>
          <div className="h-4 w-px bg-jungle-600 mx-2" />
          <button
            disabled={bulkBusy}
            onClick={() => bulkMarkRead(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-jungle-700 rounded-sm transition-colors disabled:opacity-40"
          >
            <MailOpen size={14} /> Marcar lidas
          </button>
          <button
            disabled={bulkBusy}
            onClick={() => bulkMarkRead(false)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-jungle-700 rounded-sm transition-colors disabled:opacity-40"
          >
            <Mail size={14} /> Marcar não lidas
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

      {/* Messages */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Inbox size={48} className="mx-auto mb-4 opacity-30" />
          <p>Sem mensagens{filter !== "all" ? ` ${filter === "unread" ? "não lidas" : "lidas"}` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "border rounded-sm transition-colors",
                selected.has(msg.id)
                  ? "bg-jungle-800/60 border-jungle-500/50"
                  : msg.read
                  ? "bg-jungle-900/30 border-jungle-700/20"
                  : "bg-jungle-900/60 border-jungle-600/30"
              )}
            >
              <div className="flex items-center">
                <button
                  onClick={(e) => toggleSelect(msg.id, e)}
                  className="pl-4 pr-0 py-4 text-gray-400 hover:text-white flex-shrink-0"
                  aria-label={selected.has(msg.id) ? "Desselecionar" : "Selecionar"}
                >
                  {selected.has(msg.id) ? <CheckSquare size={16} className="text-neon-green" /> : <Square size={16} />}
                </button>
                <button
                  onClick={() => toggleExpand(msg.id)}
                  className="flex-1 flex items-center gap-4 p-4 text-left"
                >
                  <div className="flex-shrink-0">
                    {msg.read ? (
                      <MailOpen size={18} className="text-gray-500" />
                    ) : (
                      <Mail size={18} className="text-jungle-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", msg.read ? "text-gray-300" : "text-white")}>
                        {msg.name}
                      </span>
                      <span className="text-gray-500 text-xs">&lt;{msg.email}&gt;</span>
                    </div>
                    <p className="text-gray-400 text-sm truncate mt-0.5">
                      {msg.subject || msg.message.substring(0, 100)}
                    </p>
                  </div>
                  <span className="text-gray-500 text-xs flex-shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {expanded === msg.id ? (
                    <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                  )}
                </button>
              </div>

              {expanded === msg.id && (
                <div className="px-4 pb-4 pt-0 border-t border-jungle-700/20 mt-0">
                  <div className="pt-4 space-y-3">
                    {msg.phone && (
                      <p className="text-gray-400 text-sm">
                        <strong className="text-gray-300">Telefone:</strong> {msg.phone}
                      </p>
                    )}
                    <div className="p-4 bg-jungle-950/50 rounded-sm">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => toggleRead(msg.id, !msg.read)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-jungle-800/50 hover:bg-jungle-800 rounded-sm transition-colors"
                      >
                        {msg.read ? <Mail size={14} /> : <MailOpen size={14} />}
                        {msg.read ? "Marcar como não lida" : "Marcar como lida"}
                      </button>
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject || "Contacto LIT Coimbra"}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-jungle-400 hover:text-white bg-jungle-800/50 hover:bg-jungle-800 rounded-sm transition-colors"
                      >
                        <Mail size={14} /> Responder
                      </a>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={deleting === msg.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-jungle-800/50 hover:bg-red-900/30 rounded-sm transition-colors ml-auto"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
