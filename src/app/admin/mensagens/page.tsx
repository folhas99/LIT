"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
  Filter,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    } catch {
      // ignore
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

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) return <p className="text-gray-500">A carregar...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
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
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
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
      </div>

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
                msg.read
                  ? "bg-jungle-900/30 border-jungle-700/20"
                  : "bg-jungle-900/60 border-jungle-600/30"
              )}
            >
              <button
                onClick={() => toggleExpand(msg.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
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
