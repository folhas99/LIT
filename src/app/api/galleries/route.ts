import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      include: {
        _count: { select: { photos: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(galleries);
  } catch (error) {
    console.error("Failed to fetch galleries:", error);
    return NextResponse.json(
      { error: "Failed to fetch galleries" },
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
    const { title, titleEn, date, eventId, coverImage, published } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      );
    }

    const slug = slugify(title);

    const existing = await prisma.gallery.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A gallery with a similar title already exists" },
        { status: 409 }
      );
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        titleEn: titleEn || null,
        slug,
        date: new Date(date),
        eventId: eventId || null,
        coverImage: coverImage || null,
        published: published ?? true,
      },
    });

    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery:", error);
    return NextResponse.json(
      { error: "Failed to create gallery" },
      { status: 500 }
    );
  }
}
