import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentAdmin, isSuperAdmin } from "@/lib/admin-auth";

/**
 * User management endpoints.
 *
 * Permission model:
 * - Any authenticated admin can list, create, update, and delete admin users.
 * - ADMIN viewers never see SUPER_ADMIN accounts: they're filtered out of
 *   the list, and creation of new SUPER_ADMINs is blocked (role is forced
 *   to "ADMIN").
 * - Only SUPER_ADMIN can touch other SUPER_ADMIN records (edit/delete
 *   responses 404 from an ADMIN's perspective to keep them hidden).
 */
export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // SUPER_ADMIN users are invisible to plain ADMINs.
    const visible = isSuperAdmin(me) ? users : users.filter((u) => u.role !== "SUPER_ADMIN");
    return NextResponse.json(visible);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password e nome são obrigatórios" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Já existe um utilizador com este email" }, { status: 409 });
    }

    // Only SUPER_ADMIN can mint SUPER_ADMIN accounts. An ADMIN trying to
    // escalate privileges is silently downgraded to ADMIN.
    const finalRole =
      role === "SUPER_ADMIN" && isSuperAdmin(me) ? "SUPER_ADMIN" : "ADMIN";

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: finalRole,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
