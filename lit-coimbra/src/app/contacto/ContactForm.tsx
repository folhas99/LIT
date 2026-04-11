"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, open mailto
    const subject = encodeURIComponent(`Contacto de ${form.name}`);
    const body = encodeURIComponent(`Nome: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:info@litcoimbra.pt?subject=${subject}&body=${body}`;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex items-center justify-center p-12 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
        <div className="text-center">
          <CheckCircle size={48} className="mx-auto text-jungle-500 mb-4" />
          <p className="text-white font-semibold">Mensagem preparada!</p>
          <p className="text-gray-400 text-sm mt-2">
            O teu cliente de email foi aberto.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-4 text-jungle-400 hover:text-jungle-300 text-sm"
          >
            Enviar outra mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 transition-colors"
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
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 transition-colors"
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
          className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 transition-colors resize-none"
          placeholder="A tua mensagem..."
        />
      </div>
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-jungle-600 hover:bg-jungle-500 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
      >
        <Send size={18} /> Enviar
      </button>
    </form>
  );
}
