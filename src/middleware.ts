import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Rewrite /uploads/* to /api/uploads/* so uploaded images are served
  // This is needed because Next.js standalone mode doesn't serve public/ files
  if (request.nextUrl.pathname.startsWith("/uploads/")) {
    const filename = request.nextUrl.pathname.replace("/uploads/", "");
    return NextResponse.rewrite(
      new URL(`/api/uploads/${filename}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/uploads/:path*"],
};
