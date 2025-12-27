import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: any) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};