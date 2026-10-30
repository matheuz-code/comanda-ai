import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/utils/auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = request.cookies.get("session")?.value;
  const session = verifySessionToken(token);

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/cozinha", request.url));
    }
  }

  if (pathname.startsWith("/cozinha")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session.role !== "admin" && session.role !== "funcionario") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cozinha/:path*"],
};
