import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { setSetting, getSetting } from "@/lib/settings";

export async function GET() {
  try {
    const favicon = await getSetting("faviconUrl");
    const logo = await getSetting("logoUrl");
    return NextResponse.json({ favicon, logo });
  } catch (error) {
    console.error("Failed to get favicon:", error);
    return NextResponse.json({ error: "Failed to get favicon settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "favicon" or "logo"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name).toLowerCase();
    const filename = type === "favicon" ? `favicon${ext}` : `logo${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const url = `/uploads/${filename}`;

    if (type === "favicon") {
      await setSetting("faviconUrl", url);
    } else {
      await setSetting("logoUrl", url);
    }

    return NextResponse.json({ url, type });
  } catch (error) {
    console.error("Failed to upload favicon:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
