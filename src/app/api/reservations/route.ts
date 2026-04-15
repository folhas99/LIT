import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";
import {
  sendEmail,
  reservationNotificationHtml,
  reservationConfirmationHtml,
} from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const eventId = searchParams.get("eventId");
    const date = searchParams.get("date");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (eventId) {
      where.eventId = eventId;
    }
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        date: true,
        guests: true,
        message: true,
        status: true,
        eventId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const origin = verifyRequestOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limit: max 3 reservation requests per 15 minutes per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`reservation:${ip}`, 3, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiados pedidos. Tenta novamente em ${rl.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, phone, date, guests, message, eventId, website } = body;

    // Honeypot
    if (website && String(website).trim().length > 0) {
      return NextResponse.json({ id: "honeypot" }, { status: 201 });
    }

    if (!name || !email || !phone || !date || !guests) {
      return NextResponse.json(
        { error: "Name, email, phone, date, and guests are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const reservationDate = new Date(date);
    const reservation = await prisma.reservation.create({
      data: {
        name,
        email,
        phone,
        date: reservationDate,
        guests: Number(guests),
        message: message || null,
        eventId: eventId || null,
      },
    });

    // Fire-and-forget emails
    (async () => {
      try {
        const settings = await getSettings();
        const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || settings.email;
        const tasks: Promise<unknown>[] = [];
        if (adminEmail) {
          tasks.push(
            sendEmail({
              to: adminEmail,
              replyTo: email,
              subject: `[LIT] Nova reserva VIP — ${name}`,
              html: reservationNotificationHtml({
                name, email, phone, date: reservationDate, guests: Number(guests), message,
              }),
            })
          );
        }
        tasks.push(
          sendEmail({
            to: email,
            subject: "Recebemos o teu pedido — LIT Coimbra",
            html: reservationConfirmationHtml({
              name, date: reservationDate, guests: Number(guests),
            }),
          })
        );
        await Promise.allSettled(tasks);
      } catch (error) {
        logError("reservations/notify", error);
      }
    })();

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
