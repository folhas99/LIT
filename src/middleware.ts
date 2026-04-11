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

  // Pass the current pathname as a header so layouts can read it
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
