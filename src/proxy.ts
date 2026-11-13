import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey =
  process.env.SESSION_SECRET ||
  "levelup_fallback_secret_key_at_least_32_chars_long_safety";
const encodedKey = new TextEncoder().encode(secretKey);

const protectedPrefixes = ["/dashboard", "/quests", "/tasks", "/knowledge", "/progression", "/settings"];
const authPrefixes = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionCookie = req.cookies.get("level_up_session")?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, encodedKey);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  const isAuthRoute = authPrefixes.some((p) => pathname.startsWith(p));

  // If trying to access protected route without valid session
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and trying to access login/register
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

