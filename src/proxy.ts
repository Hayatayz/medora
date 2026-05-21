import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/pricing",
  "/about",
  "/contact",
];

const authRoutes = ["/login", "/register", "/forgot-password"];

const adminRoutes = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("medora-token")?.value;
  const user = token ? await verifyToken(token) : null;

  // Redirect logged-in users away from auth pages
  if (authRoutes.some((r) => pathname.startsWith(r))) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Allow public routes through
  if (publicRoutes.some((r) => pathname === r)) {
    return NextResponse.next();
  }

  // Protect everything else
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.svg).*)"],
};