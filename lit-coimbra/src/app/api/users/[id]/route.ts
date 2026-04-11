import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
    });
    if (currentUser?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Apenas SUPER_ADMIN pode editar utilizadores" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role } = body;

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
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
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
    });
    if (currentUser?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Apenas SUPER_ADMIN pode apagar utilizadores" }, { status: 403 });
    }

    const { id } = await params;

    // Prevent deleting SUPER_ADMIN users
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }
    if (targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Não é possível apagar um SUPER_ADMIN" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Utilizador eliminado" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
