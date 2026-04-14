import type { NextRequest } from "next/server";

/**
 * Pragmatic CSRF defense: verify the request's Origin (or Referer) matches
 * an allowed origin. Cross-site POSTs from untrusted origins will either
 * omit the Origin header (old browsers) or send a different one; same-site
 * browser requests always send the correct Origin.
 *
 * For state-changing endpoints (POST/PUT/DELETE) invoked from public forms.
 * Admin endpoints rely on the NextAuth session check.
 */
export function verifyRequestOrigin(
  request: Request | NextRequest
): { ok: true } | { ok: false; reason: string } {
  const method = request.method.toUpperCase();
  // Only guard state-changing methods
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { ok: true };
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  const allowedOrigins = new Set<string>();
  if (host) {
    allowedOrigins.add(`http://${host}`);
    allowedOrigins.add(`https://${host}`);
  }
  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl) {
    try {
      allowedOrigins.add(new URL(envUrl).origin);
    } catch {
      // ignore
    }
  }

  const sourceOrigin =
    origin ||
    (referer
      ? (() => {
          try {
            return new URL(referer).origin;
          } catch {
            return null;
          }
        })()
      : null);

  if (!sourceOrigin) {
    return { ok: false, reason: "Missing Origin/Referer header" };
  }

  if (!allowedOrigins.has(sourceOrigin)) {
    return { ok: false, reason: "Untrusted origin" };
  }

  return { ok: true };
}
