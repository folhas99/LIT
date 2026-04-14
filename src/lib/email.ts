/**
 * Email sending via Resend REST API.
 * Silently logs failures so form submission never breaks.
 *
 * Required env vars:
 *   RESEND_API_KEY     -- from https://resend.com/api-keys
 *   EMAIL_FROM         -- e.g. "LIT Coimbra <noreply@litcoimbra.pt>"
 *   ADMIN_NOTIFY_EMAIL -- where admin notifications should arrive (optional; falls back to settings.email)
 */

import { logError } from "./logger";

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY or EMAIL_FROM not configured — skipping send");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logError("email/send", new Error(`Resend ${res.status}: ${text}`));
      return false;
    }
    return true;
  } catch (error) {
    logError("email/send", error);
    return false;
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- Templates ---------- */

export function contactNotificationHtml(data: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a1f0f;color:#fff;padding:32px;border-radius:8px">
      <h2 style="margin:0 0 16px;color:#39FF14">Nova mensagem de contacto</h2>
      <p style="color:#9ca3af;margin:0 0 24px">Recebeste uma nova mensagem no site do LIT Coimbra.</p>
      <table style="width:100%;border-collapse:collapse;color:#fff">
        <tr><td style="padding:8px 0;color:#9ca3af;width:120px">Nome:</td><td>${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af">Email:</td><td><a href="mailto:${escapeHtml(data.email)}" style="color:#39FF14">${escapeHtml(data.email)}</a></td></tr>
        ${data.phone ? `<tr><td style="padding:8px 0;color:#9ca3af">Telefone:</td><td>${escapeHtml(data.phone)}</td></tr>` : ""}
        ${data.subject ? `<tr><td style="padding:8px 0;color:#9ca3af">Assunto:</td><td>${escapeHtml(data.subject)}</td></tr>` : ""}
      </table>
      <div style="margin-top:24px;padding:16px;background:#0f2d16;border-radius:4px;border-left:3px solid #39FF14">
        <p style="margin:0;white-space:pre-wrap;color:#e5e7eb">${escapeHtml(data.message)}</p>
      </div>
    </div>
  `;
}

export function reservationNotificationHtml(data: {
  name: string;
  email: string;
  phone: string;
  date: Date;
  guests: number;
  message?: string | null;
}): string {
  const dateStr = data.date.toLocaleString("pt-PT", { dateStyle: "full", timeStyle: "short" });
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a1f0f;color:#fff;padding:32px;border-radius:8px">
      <h2 style="margin:0 0 16px;color:#39FF14">Novo pedido de reserva VIP</h2>
      <table style="width:100%;border-collapse:collapse;color:#fff">
        <tr><td style="padding:8px 0;color:#9ca3af;width:120px">Nome:</td><td>${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af">Email:</td><td><a href="mailto:${escapeHtml(data.email)}" style="color:#39FF14">${escapeHtml(data.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af">Telefone:</td><td>${escapeHtml(data.phone)}</td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af">Data:</td><td>${escapeHtml(dateStr)}</td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af">Pessoas:</td><td>${data.guests}</td></tr>
      </table>
      ${data.message ? `<div style="margin-top:24px;padding:16px;background:#0f2d16;border-radius:4px;border-left:3px solid #39FF14"><p style="margin:0;white-space:pre-wrap">${escapeHtml(data.message)}</p></div>` : ""}
    </div>
  `;
}

export function reservationConfirmationHtml(data: {
  name: string;
  date: Date;
  guests: number;
}): string {
  const dateStr = data.date.toLocaleString("pt-PT", { dateStyle: "full", timeStyle: "short" });
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a1f0f;color:#fff;padding:32px;border-radius:8px">
      <h2 style="margin:0 0 16px;color:#39FF14">Recebemos o teu pedido 🌴</h2>
      <p>Olá ${escapeHtml(data.name)},</p>
      <p style="color:#d1d5db">Recebemos o teu pedido de reserva VIP para <strong style="color:#fff">${escapeHtml(dateStr)}</strong> (${data.guests} ${data.guests === 1 ? "pessoa" : "pessoas"}).</p>
      <p style="color:#d1d5db">Vamos entrar em contacto contigo em breve para confirmar a disponibilidade.</p>
      <p style="margin-top:32px;color:#9ca3af;font-size:13px">LIT Coimbra — A tua nova casa.</p>
    </div>
  `;
}
