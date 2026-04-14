"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar mensagem");
      }

      setStatus("sent");
      setForm({ name: "", email: "", message: "", website: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro ao enviar mensagem. Tenta novamente.");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex items-center justify-center p-12 bg-jungle-900/50 border border-jungle-700/30 rounded-sm neon-border animate-fade-in-scale">
        <div className="text-center">
          <CheckCircle size={48} className="mx-auto text-neon-green/80 mb-4" />
          <p className="text-white font-semibold">Mensagem enviada!</p>
          <p className="text-gray-400 text-sm mt-2">
            Responderemos assim que possível.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 text-jungle-400 hover:text-neon-green/70 text-sm transition-colors duration-300"
          >
            Enviar outra mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — hidden from real users, bots will fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />
      {status === "error" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-900/30 border border-red-700/30 rounded-sm text-red-400 text-sm">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}
      <div>
        <label htmlFor="contact-name" className="block text-sm text-gray-300 mb-2">
          Nome
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 form-input-premium"
          placeholder="O teu nome"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm text-gray-300 mb-2">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 form-input-premium"
          placeholder="email@exemplo.pt"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm text-gray-300 mb-2">
          Mensagem
        </label>
        <textarea
          id="contact-message"
          rows={5}
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 form-input-premium resize-none"
          placeholder="A tua mensagem..."
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-sm transition-all duration-300 rounded-sm hover:shadow-[0_0_20px_rgba(57,255,20,0.1)]"
      >
        {status === "sending" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> A enviar...
          </>
        ) : (
          <>
            <Send size={18} /> Enviar
          </>
        )}
      </button>
    </form>
  );
}
