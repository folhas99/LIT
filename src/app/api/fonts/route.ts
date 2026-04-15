import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { revalidateAllPublicPaths } from "@/lib/revalidate";

const ALLOWED_EXTS = new Set(["woff2", "woff", "ttf", "otf"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file — fonts should be small

const FONT_DIR = path.join(process.cwd(), "public", "uploads", "fonts");
const FONT_URL_BASE = "/uploads/fonts";

/* GET — list all uploaded fonts (most recent first). Public so the public
   site can render the family picker if ever needed; only metadata. */
export async function GET() {
  try {
    const fonts = await prisma.font.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(fonts);
  } catch (error) {
    console.error("Failed to list fonts:", error);
    return NextResponse.json({ error: "Failed to list fonts" }, { status: 500 });
  }
}

/* POST — multipart upload of a single font file. Auth required. */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const overrideName = (formData.get("name") as string | null)?.trim() || "";
    const weightRaw = (formData.get("weight") as string | null) || "400";
    const style = ((formData.get("style") as string | null) || "normal").trim();
    const display = ((formData.get("display") as string | null) || "swap").trim();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json(
        { error: "Invalid font format. Allowed: woff2, woff, ttf, otf" },
        { status: 400 },
      );
    }

    const weight = Math.min(900, Math.max(100, parseInt(weightRaw, 10) || 400));
    const safeStyle = style === "italic" ? "italic" : "normal";
    const safeDisplay = ["swap", "block", "optional", "fallback"].includes(display)
      ? display
      : "swap";

    // Derive a default display name from the original filename if none given.
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
    const displayName = overrideName || baseName || "Custom Font";
    const family = displayName; // by default the family equals the display name

    const filename = `${randomUUID()}.${ext}`;
    await mkdir(FONT_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(FONT_DIR, filename), buffer);

    const created = await prisma.font.create({
      data: {
        name: displayName,
        family,
        originalName: file.name,
        filename,
        url: `${FONT_URL_BASE}/${filename}`,
        format: ext,
        size: file.size,
        weight,
        style: safeStyle,
        display: safeDisplay,
      },
    });

    // Stylesheet route is cached as a static asset; bust the public site so the
    // new font shows up immediately on the next page render.
    revalidateAllPublicPaths();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to upload font:", error);
    return NextResponse.json({ error: "Failed to upload font" }, { status: 500 });
  }
}
