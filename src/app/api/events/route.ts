import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidateAllPublicPaths } from "@/lib/revalidate";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const upcoming = searchParams.get("upcoming");

    const where: Record<string, unknown> = {};

    if (published === "true") {
      where.published = true;
    } else if (published === "false") {
      where.published = false;
    }

    if (upcoming === "true") {
      where.date = { gte: new Date() };
    }

    // Only the fields needed by list views — callers wanting full content
    // hit /api/events/[id] or the dedicated event page. Keeps the list
    // payload small and avoids shipping large `description` / `lineup` HTML.
    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        date: true,
        endDate: true,
        image: true,
        eventType: true,
        featured: true,
        published: true,
        createdAt: true,
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      titleEn,
      description,
      descriptionEn,
      date,
      endDate,
      image,
      lineup,
      lineupEn,
      eventType,
      featured,
      published,
    } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      );
    }

    const slug = slugify(title);

    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "An event with a similar title already exists" },
        { status: 409 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        titleEn: titleEn || null,
        slug,
        description: description || null,
        descriptionEn: descriptionEn || null,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        image: image || null,
        lineup: lineup || null,
        lineupEn: lineupEn || null,
        eventType: eventType || null,
        featured: featured ?? false,
        published: published ?? true,
      },
    });

    revalidateAllPublicPaths();
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
