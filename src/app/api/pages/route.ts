import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAllPublicPaths } from "@/lib/revalidate";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** GET /api/pages — list all pages (admin only).  */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pages = await prisma.page.findMany({
      orderBy: [{ system: "desc" }, { navOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { sections: true } } },
    });
    return NextResponse.json(
      pages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        titleEn: p.titleEn,
        description: p.description,
        system: p.system,
        published: p.published,
        showInNav: p.showInNav,
        navLabel: p.navLabel,
        navLabelEn: p.navLabelEn,
        navOrder: p.navOrder,
        sectionCount: p._count.sections,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Failed to list pages:", error);
    return NextResponse.json({ error: "Failed to list pages" }, { status: 500 });
  }
}

/** POST /api/pages — create a new (non-system) page. */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = String(body.slug || "").trim().toLowerCase();
    const title = String(body.title || "").trim();

    if (!slug || !title) {
      return NextResponse.json(
        { error: "slug and title are required" },
        { status: 400 }
      );
    }
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json(
        { error: "slug deve conter apenas letras minúsculas, números e hífens" },
        { status: 400 }
      );
    }

    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Já existe uma página com esse slug" }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        slug,
        title,
        titleEn: body.titleEn || null,
        description: body.description || null,
        system: false,
        published: body.published ?? true,
        showInNav: body.showInNav ?? false,
        navLabel: body.navLabel || null,
        navLabelEn: body.navLabelEn || null,
        navOrder: Number(body.navOrder) || 100,
      },
    });

    // New page (potentially in nav) → invalidate layout + the new public route.
    revalidateAllPublicPaths();
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Failed to create page:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
