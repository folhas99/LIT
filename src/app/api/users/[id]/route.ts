import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentAdmin, isSuperAdmin, type AdminUser } from "@/lib/admin-auth";

/**
 * Helpers: from an ADMIN's perspective, SUPER_ADMIN records simply don't
 * exist. Return 404 (not 403) so we never hint at their presence.
 */
async function loadTargetForRequester(requester: AdminUser, id: string) {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { status: 404 as const, target: null };
  if (!isSuperAdmin(requester) && target.role === "SUPER_ADMIN") {
    return { status: 404 as const, target: null };
  }
  return { status: 200 as const, target };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status, target } = await loadTargetForRequester(me, id);
    if (status === 404 || !target) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (email) data.email = email;

    // Role changes are limited: an ADMIN can never promote anyone to
    // SUPER_ADMIN. SUPER_ADMINs can change roles freely.
    if (role) {
      if (role === "SUPER_ADMIN" && !isSuperAdmin(me)) {
        // Silently ignore the escalation attempt.
      } else {
        data.role = role;
      }
    }

    if (password && password.length >= 6) {
      data.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status, target } = await loadTargetForRequester(me, id);
    if (status === 404 || !target) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    // SUPER_ADMIN accounts can never be deleted via the API — even by
    // another SUPER_ADMIN — to keep a bootstrap account safe. Demote first
    // if one really needs to be removed.
    if (target.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Não é possível apagar um SUPER_ADMIN" },
        { status: 403 }
      );
    }

    // Don't let an admin lock themselves out.
    if (target.id === me.id) {
      return NextResponse.json(
        { error: "Não podes apagar a tua própria conta." },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Utilizador eliminado" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
