import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, contactNotificationHtml } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { logError } from "@/lib/logger";
import { verifyRequestOrigin } from "@/lib/csrf";

// GET: List all messages (admin)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST: Submit a contact message (public)
export async function POST(request: NextRequest) {
  const origin = verifyRequestOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limit: max 5 messages per 10 minutes per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiados pedidos. Tenta novamente em ${rl.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, phone, subject, message, website } = body;

    // Honeypot — bots often fill hidden fields
    if (website && String(website).trim().length > 0) {
      return NextResponse.json({ success: true, id: "honeypot" }, { status: 201 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "name, email and message are required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (String(message).length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const msg = await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, subject: subject || null, message },
    });

    // Fire-and-forget admin notification
    (async () => {
      try {
        const settings = await getSettings();
        const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || settings.email;
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            replyTo: email,
            subject: `[LIT] Nova mensagem de ${name}`,
            html: contactNotificationHtml({ name, email, phone, subject, message }),
          });
        }
      } catch (error) {
        logError("contact/notify", error);
      }
    })();

    return NextResponse.json({ success: true, id: msg.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
