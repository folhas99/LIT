import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultSectionsFor, isSystemPageSlug } from "@/lib/page-defaults";
import { revalidatePageBySlug, revalidateAllPublicPaths } from "@/lib/revalidate";

/**
 * POST /api/pages/[id]/reseed — destructively replace all sections of a
 * system page with the default layout from `src/lib/page-defaults.ts`.
 *
 * Admin-only. Only available for system pages; user-created pages have no
 * canonical default layout to restore to.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
      select: { id: true, slug: true, system: true },
    });
    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!page.system || !isSystemPageSlug(page.slug)) {
      return NextResponse.json(
        { error: "Apenas páginas do sistema têm layout default." },
        { status: 400 }
      );
    }

    const defaults = defaultSectionsFor(page.slug);
    if (defaults.length === 0) {
      return NextResponse.json(
        { error: "Sem layout default para esta página." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.pageSection.deleteMany({ where: { page: page.slug } }),
      ...defaults.map((section) =>
        prisma.pageSection.create({
          data: {
            page: page.slug,
            type: section.type,
            content: JSON.stringify(section.content),
            spacing: section.spacing ? JSON.stringify(section.spacing) : null,
            order: section.order,
            visible: true,
          },
        })
      ),
    ]);

    revalidatePageBySlug(page.slug);
    revalidateAllPublicPaths();

    return NextResponse.json({
      success: true,
      slug: page.slug,
      sectionsCreated: defaults.length,
    });
  } catch (error) {
    console.error("Failed to reseed page:", error);
    return NextResponse.json({ error: "Failed to reseed page" }, { status: 500 });
  }
}
