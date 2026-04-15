import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Helpers that centralise the ADMIN vs SUPER_ADMIN policy used across the
 * /api/* routes.
 *
 * Policy (as of 2026-04):
 * - ADMIN and SUPER_ADMIN have **identical** permissions over site content,
 *   theme, pages, media, logs, etc. Any authenticated admin can edit.
 * - The only distinction is that SUPER_ADMIN users are **invisible** to
 *   ADMIN users in the /admin/utilizadores list and its CRUD endpoints.
 * - An ADMIN therefore cannot create, edit, or delete a SUPER_ADMIN account,
 *   nor promote themselves or anyone else to SUPER_ADMIN.
 *
 * Lower-privileged roles (if ever introduced) should gate here and not
 * re-implement session lookups in every route handler.
 */

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

/**
 * Returns the current admin user if the request belongs to one, else null.
 * Use at the top of protected routes instead of re-wiring getServerSession
 * yourself.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) return null;
  return user as AdminUser;
}

export function isSuperAdmin(user: AdminUser | null | undefined): boolean {
  return user?.role === "SUPER_ADMIN";
}
