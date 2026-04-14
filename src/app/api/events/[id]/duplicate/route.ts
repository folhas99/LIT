import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const source = await prisma.event.findUnique({ where: { id } });
    if (!source) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Find unique slug — append -copia, -copia-2, ...
    const baseTitle = `${source.title} (cópia)`;
    const baseSlug = slugify(baseTitle);
    let slug = baseSlug;
    let suffix = 2;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    // Default new date: one week after original
    const newDate = new Date(source.date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newEndDate = source.endDate
      ? new Date(source.endDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      : null;

    const created = await prisma.event.create({
      data: {
        title: baseTitle,
        slug,
        description: source.description,
        date: newDate,
        endDate: newEndDate,
        image: source.image,
        lineup: source.lineup,
        eventType: source.eventType,
        featured: false,
        published: false,
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user?.email ?? null,
          userName: session.user?.name ?? null,
          action: "duplicate",
          entity: "event",
          entityId: created.id,
          details: source.title,
        },
      });
    } catch {
      // ActivityLog table might not exist yet
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to duplicate event:", error);
    return NextResponse.json(
      { error: "Failed to duplicate event" },
      { status: 500 }
    );
  }
}
