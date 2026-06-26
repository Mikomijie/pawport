import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (
    (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") &&
    sessionId
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
