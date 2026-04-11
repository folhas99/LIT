import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecentErrors, clearErrors } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as { role?: string }).role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Server info
    const memoryUsage = process.memoryUsage();
    const serverInfo = {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || "unknown",
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
    };

    // Database test
    let dbStatus: { connected: boolean; latencyMs: number; error?: string } = {
      connected: false,
      latencyMs: 0,
    };
    try {
      const start = Date.now();
      await prisma.$queryRawUnsafe("SELECT 1");
      dbStatus = {
        connected: true,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      dbStatus = {
        connected: false,
        latencyMs: 0,
        error: err instanceof Error ? err.message : String(err),
      };
    }

    // Recent errors
    const recentErrors = getRecentErrors();

    return NextResponse.json({
      server: serverInfo,
      database: dbStatus,
      errors: recentErrors,
      errorCount: recentErrors.length,
    });
  } catch (error) {
    console.error("Debug logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch diagnostics" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user as { role?: string }).role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    clearErrors();

    return NextResponse.json({ message: "Error log cleared" });
  } catch (error) {
    console.error("Clear logs error:", error);
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 }
    );
  }
}
