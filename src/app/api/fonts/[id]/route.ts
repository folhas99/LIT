import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import { revalidateAllPublicPaths } from "@/lib/revalidate";

const FONT_DIR = path.join(process.cwd(), "public", "uploads", "fonts");

/* PATCH — update editable metadata (name, family, weight, style, display).
   Filename and stored bytes are immutable. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const data: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) {
      data.name = body.name.trim();
    }
    if (typeof body.family === "string" && body.family.trim()) {
      data.family = body.family.trim();
    }
    if (typeof body.weight === "number") {
      data.weight = Math.min(900, Math.max(100, Math.round(body.weight)));
    }
    if (body.style === "italic" || body.style === "normal") {
      data.style = body.style;
    }
    if (
      body.display === "swap" ||
      body.display === "block" ||
      body.display === "optional" ||
      body.display === "fallback"
    ) {
      data.display = body.display;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
    }

    const updated = await prisma.font.update({ where: { id }, data });
    revalidateAllPublicPaths();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update font:", error);
    return NextResponse.json({ error: "Failed to update font" }, { status: 500 });
  }
}

/* DELETE — remove the DB row + the file on disk. Best-effort on the file:
   if it's already gone, the DB delete still succeeds. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const font = await prisma.font.findUnique({ where: { id } });
    if (!font) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 });
    }

    await prisma.font.delete({ where: { id } });

    try {
      await unlink(path.join(FONT_DIR, font.filename));
    } catch {
      // file may already be missing — log only
      console.warn(`Font file ${font.filename} could not be removed (already gone?).`);
    }

    revalidateAllPublicPaths();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete font:", error);
    return NextResponse.json({ error: "Failed to delete font" }, { status: 500 });
  }
}
