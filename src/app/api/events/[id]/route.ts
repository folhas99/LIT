import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidateAllPublicPaths } from "@/lib/revalidate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
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

    const data: Record<string, unknown> = {};

    if (title !== undefined) {
      data.title = title;
      data.slug = slugify(title);
    }
    if (titleEn !== undefined) data.titleEn = titleEn;
    if (description !== undefined) data.description = description;
    if (descriptionEn !== undefined) data.descriptionEn = descriptionEn;
    if (date !== undefined) data.date = new Date(date);
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (image !== undefined) data.image = image;
    if (lineup !== undefined) data.lineup = lineup;
    if (lineupEn !== undefined) data.lineupEn = lineupEn;
    if (eventType !== undefined) data.eventType = eventType;
    if (featured !== undefined) data.featured = featured;
    if (published !== undefined) data.published = published;

    const event = await prisma.event.update({
      where: { id },
      data,
    });

    revalidateAllPublicPaths();
    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
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

    await prisma.event.delete({ where: { id } });

    revalidateAllPublicPaths();
    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
