import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { revalidateAllPublicPaths } from "@/lib/revalidate";

export async function GET() {
  try {
    const settings = await getSettings();
    const themeSettings: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (key.startsWith("theme")) {
        themeSettings[key] = value;
      }
    }
    return NextResponse.json(themeSettings);
  } catch (error) {
    console.error("Failed to fetch theme settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only SUPER_ADMIN can update theme
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
    });
    if (currentUser?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Apenas SUPER_ADMIN pode alterar o tema" },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Request body must be an object of key-value pairs" },
        { status: 400 }
      );
    }

    // Only allow theme keys
    for (const [key, value] of Object.entries(body)) {
      if (!key.startsWith("theme")) {
        continue;
      }
      await setSetting(key, String(value));
    }

    // Theme variables flow into the root layout — bust every cached page.
    revalidateAllPublicPaths();

    // Return updated theme settings
    const settings = await getSettings();
    const themeSettings: Record<string, string> = {};
    for (const [k, v] of Object.entries(settings)) {
      if (k.startsWith("theme")) {
        themeSettings[k] = v;
      }
    }
    return NextResponse.json(themeSettings);
  } catch (error) {
    console.error("Failed to update theme settings:", error);
    return NextResponse.json(
      { error: "Failed to update theme settings" },
      { status: 500 }
    );
  }
}
