import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Any authenticated admin can list the media library (SUPER_ADMIN or ADMIN),
    // because the media picker is used across the whole admin editor.
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let files: string[];
    try {
      files = await readdir(UPLOADS_DIR);
    } catch {
      // Directory doesn't exist yet
      return NextResponse.json([]);
    }

    const mediaFiles = await Promise.all(
      files
        .filter((f) => !f.startsWith("."))
        .map(async (filename) => {
          const filePath = path.join(UPLOADS_DIR, filename);
          const fileStat = await stat(filePath);
          const ext = path.extname(filename).toLowerCase().replace(".", "");
          return {
            filename,
            url: `/uploads/${filename}`,
            size: fileStat.size,
            lastModified: fileStat.mtimeMs,
            type: ext,
          };
        })
    );

    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error("Failed to list media:", error);
    return NextResponse.json(
      { error: "Failed to list media files" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filename } = body as { filename?: string };

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeName);

    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
