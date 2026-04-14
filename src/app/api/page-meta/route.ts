import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllPageMeta, setPageMeta, PAGES, type PageKey } from "@/lib/page-meta";

export async function GET() {
  try {
    const all = await getAllPageMeta();
    return NextResponse.json(all);
  } catch (error) {
    console.error("Failed to fetch page meta:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    for (const [page, data] of Object.entries(body)) {
      if (!PAGES.includes(page as PageKey)) continue;
      if (typeof data !== "object" || data === null) continue;
      const d = data as Partial<{
        title: string;
        description: string;
        ogImage: string;
        noIndex: boolean;
      }>;
      await setPageMeta(page as PageKey, {
        title: d.title ?? "",
        description: d.description ?? "",
        ogImage: d.ogImage ?? "",
        noIndex: !!d.noIndex,
      });
    }
    const all = await getAllPageMeta();
    return NextResponse.json(all);
  } catch (error) {
    console.error("Failed to update page meta:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
