import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const filename = segments.join("/");

    // Security: prevent directory traversal
    const safeName = path.basename(filename);
    if (safeName !== filename || filename.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", safeName);

    // Check file exists
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    const ext = safeName.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
