import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePageBySlug, revalidateAllPublicPaths } from "@/lib/revalidate";

/** PATCH /api/pages/[id] — update page metadata (any admin). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") data.title = body.title;
    if ("titleEn" in body) data.titleEn = body.titleEn || null;
    if ("description" in body) data.description = body.description || null;
    if (typeof body.published === "boolean") data.published = body.published;
    if (typeof body.showInNav === "boolean") data.showInNav = body.showInNav;
    if ("navLabel" in body) data.navLabel = body.navLabel || null;
    if ("navLabelEn" in body) data.navLabelEn = body.navLabelEn || null;
    if (body.navOrder !== undefined) data.navOrder = Number(body.navOrder);

    const updated = await prisma.page.update({ where: { id }, data });
    // Page metadata change affects this page's HTML and the global nav (Header).
    revalidatePageBySlug(updated.slug);
    revalidateAllPublicPaths();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update page:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

/** DELETE /api/pages/[id] — delete a non-system page (SUPER_ADMIN). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.system) {
      return NextResponse.json(
        { error: "Não é possível eliminar páginas do sistema" },
        { status: 400 }
      );
    }

    // Sections cascade-delete via the FK declared in the schema.
    await prisma.page.delete({ where: { id } });
    revalidatePageBySlug(existing.slug);
    revalidateAllPublicPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
