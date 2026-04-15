import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePageBySlug } from "@/lib/revalidate";

// GET: Get all sections for a page (public)
export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page");
  if (!page) {
    return NextResponse.json({ error: "page parameter required" }, { status: 400 });
  }

  try {
    const sections = await prisma.pageSection.findMany({
      where: { page },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error("Failed to fetch sections:", error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

// POST: Create a new section (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { page, type, content, order, visible, spacing } = body;

    if (!page || !type) {
      return NextResponse.json({ error: "page and type are required" }, { status: 400 });
    }

    const section = await prisma.pageSection.create({
      data: {
        page,
        type,
        content: typeof content === "string" ? content : JSON.stringify(content || {}),
        order: order ?? 0,
        visible: visible ?? true,
        spacing: spacing ? (typeof spacing === "string" ? spacing : JSON.stringify(spacing)) : null,
      },
    });

    revalidatePageBySlug(page);
    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Failed to create section:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}

// PUT: Bulk update sections (reorder, update content)
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const touchedPages = new Set<string>();
    if (Array.isArray(body)) {
      // Bulk update (reorder)
      for (const item of body) {
        await prisma.pageSection.update({
          where: { id: item.id },
          data: {
            order: item.order ?? undefined,
            visible: item.visible ?? undefined,
            content: item.content ? (typeof item.content === "string" ? item.content : JSON.stringify(item.content)) : undefined,
            spacing: item.spacing ? (typeof item.spacing === "string" ? item.spacing : JSON.stringify(item.spacing)) : undefined,
          },
        });
        if (item.page) touchedPages.add(item.page);
      }
    }

    for (const slug of touchedPages) revalidatePageBySlug(slug);

    const page = body[0]?.page;
    const sections = page
      ? await prisma.pageSection.findMany({ where: { page }, orderBy: { order: "asc" } })
      : [];

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Failed to update sections:", error);
    return NextResponse.json({ error: "Failed to update sections" }, { status: 500 });
  }
}
