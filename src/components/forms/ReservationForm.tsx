"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, AlertCircle, Crown } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

type EventOption = { id: string; title: string; date: string };

type Props = {
  /** If false, hide the event selector. */
  showEventSelector?: boolean;
  /** If false, hide the VIP badge + title. Useful when the section renders its own header. */
  showHeader?: boolean;
  titleOverride?: string;
  subtitleOverride?: string;
};

/**
 * Standalone VIP reservation form. Extracted from /reservas so it can be
 * dropped into any page as a section.
 */
export default function ReservationForm({
  showEventSelector = true,
  showHeader = true,
  titleOverride,
  subtitleOverride,
}: Props) {
  const { locale } = useI18n();
  const t =
    locale === "en"
      ? {
          experienceTag: "VIP Experience",
          heading: "VIP Reservations",
          subtitle: "Reserve your table and secure an exclusive experience.",
          name: "Name",
          namePlaceholder: "Your name",
          email: "Email",
          phone: "Phone",
          date: "Date",
          guests: "Number of Guests",
          eventOptional: "Event (optional)",
          noEvent: "No specific event",
          messageOptional: "Message (optional)",
          messagePlaceholder: "Special requests, celebrations...",
          submit: "Send Reservation",
          submitting: "Sending...",
          successTitle: "Reservation Sent!",
          successBody:
            "Thank you! Your reservation was sent successfully. We'll be in touch shortly to confirm.",
          newReservation: "New Reservation",
          errorFallback: "Error sending reservation",
        }
      : {
          experienceTag: "Experiência VIP",
          heading: "Reservas VIP",
          subtitle: "Reserva a tua mesa e garante uma experiência exclusiva.",
          name: "Nome",
          namePlaceholder: "O teu nome",
          email: "Email",
          phone: "Telefone",
          date: "Data",
          guests: "N.º de Pessoas",
          eventOptional: "Evento (opcional)",
          noEvent: "Sem evento específico",
          messageOptional: "Mensagem (opcional)",
          messagePlaceholder: "Pedidos especiais, celebrações...",
          submit: "Enviar Reserva",
          submitting: "A enviar...",
          successTitle: "Reserva Enviada!",
          successBody:
            "Obrigado! A tua reserva foi enviada com sucesso. Entraremos em contacto brevemente para confirmar.",
          newReservation: "Nova Reserva",
          errorFallback: "Erro ao enviar reserva",
        };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    guests: 2,
    message: "",
    eventId: "",
    website: "",
  });
  const [events, setEvents] = useState<EventOption[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!showEventSelector) return;
    fetch("/api/events?upcoming=true&published=true")
      .then((r) => r.json())
      .then((data) => setEvents(data))
      .catch(() => {});
  }, [showEventSelector]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guests: Number(form.guests),
          date: new Date(form.date).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.errorFallback);
      }

      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        guests: 2,
        message: "",
        eventId: "",
        website: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t.errorFallback);
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center max-w-md animate-fade-in-scale">
          <div className="relative inline-block mb-6">
            <CheckCircle size={64} className="mx-auto text-neon-green/80" />
            <div className="absolute inset-0 animate-pulse-glow rounded-full" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{t.successTitle}</h2>
          <p className="text-gray-400 mb-8">{t.successBody}</p>
          <button
            onClick={() => setStatus("idle")}
            className="px-6 py-3 bg-jungle-600 hover:bg-jungle-500 text-white font-semibold tracking-wider uppercase text-sm transition-all duration-300 rounded-sm hover:shadow-[0_0_20px_rgba(57,255,20,0.15)]"
          >
            {t.newReservation}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {showHeader && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Crown size={20} className="text-accent-gold" />
            <span className="text-xs uppercase tracking-widest vip-badge font-bold">
              {t.experienceTag}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-wide animate-fade-in">
            {titleOverride || t.heading}
          </h2>
          <div className="mt-3 w-20 h-0.5 bg-gradient-to-r from-accent-gold/80 to-accent-gold/20" />
          <p className="mt-4 text-gray-400 text-lg">
            {subtitleOverride || t.subtitle}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label htmlFor="res-name" className="block text-sm text-gray-300 mb-2">
            {t.name} *
          </label>
          <input
            id="res-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 form-input-premium"
            placeholder={t.namePlaceholder}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-email" className="block text-sm text-gray-300 mb-2">
              {t.email} *
            </label>
            <input
              id="res-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 form-input-premium"
              placeholder="email@exemplo.pt"
            />
          </div>
          <div>
            <label htmlFor="res-phone" className="block text-sm text-gray-300 mb-2">
              {t.phone} *
            </label>
            <input
              id="res-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 form-input-premium"
              placeholder="+351 912 345 678"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="res-date" className="block text-sm text-gray-300 mb-2">
              {t.date} *
            </label>
            <input
              id="res-date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 form-input-premium"
            />
          </div>
          <div>
            <label htmlFor="res-guests" className="block text-sm text-gray-300 mb-2">
              {t.guests} *
            </label>
            <input
              id="res-guests"
              type="number"
              required
              min={1}
              max={50}
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 form-input-premium"
            />
          </div>
        </div>

        {showEventSelector && events.length > 0 && (
          <div>
            <label htmlFor="res-event" className="block text-sm text-gray-300 mb-2">
              {t.eventOptional}
            </label>
            <select
              id="res-event"
              value={form.eventId}
              onChange={(e) => setForm({ ...form, eventId: e.target.value })}
              className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white focus:outline-none focus:border-jungle-500 form-input-premium"
            >
              <option value="">{t.noEvent}</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="res-message" className="block text-sm text-gray-300 mb-2">
            {t.messageOptional}
          </label>
          <textarea
            id="res-message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 form-input-premium resize-none"
            placeholder={t.messagePlaceholder}
          />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold tracking-wider uppercase text-sm transition-all duration-300 rounded-sm animate-pulse-glow hover:shadow-[0_0_25px_rgba(57,255,20,0.2)]"
        >
          <Send size={18} />
          {status === "loading" ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}
