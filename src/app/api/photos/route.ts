import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { photos } = body;

    if (!Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { error: "An array of photos is required" },
        { status: 400 }
      );
    }

    for (const photo of photos) {
      if (!photo.url || !photo.galleryId) {
        return NextResponse.json(
          { error: "Each photo must have a url and galleryId" },
          { status: 400 }
        );
      }
    }

    const created = await prisma.photo.createMany({
      data: photos.map(
        (
          photo: { url: string; alt?: string | null; blurDataUrl?: string | null; galleryId: string },
          index: number
        ) => ({
          url: photo.url,
          alt: photo.alt || null,
          blurDataUrl: photo.blurDataUrl || null,
          galleryId: photo.galleryId,
          order: index,
        })
      ),
    });

    return NextResponse.json(
      { message: `${created.count} photos added` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add photos:", error);
    return NextResponse.json(
      { error: "Failed to add photos" },
      { status: 500 }
    );
  }
}
