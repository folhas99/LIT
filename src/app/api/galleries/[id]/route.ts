import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: "asc" } },
        event: true,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, titleEn, date, eventId, coverImage, published } = body;

    const data: Record<string, unknown> = {};

    if (title !== undefined) {
      data.title = title;
      data.slug = slugify(title);
    }
    if (titleEn !== undefined) data.titleEn = titleEn;
    if (date !== undefined) data.date = new Date(date);
    if (eventId !== undefined) data.eventId = eventId || null;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (published !== undefined) data.published = published;

    const gallery = await prisma.gallery.update({
      where: { id },
      data,
    });

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Failed to update gallery:", error);
    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Photos are cascade-deleted via Prisma schema
    await prisma.gallery.delete({ where: { id } });

    return NextResponse.json({ message: "Gallery deleted" });
  } catch (error) {
    console.error("Failed to delete gallery:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery" },
      { status: 500 }
    );
  }
}
