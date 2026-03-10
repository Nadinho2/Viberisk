import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/risk",
  "/btc-usdt",
  "/btc",
  "/eth",
  "/sol",
  "/bnb",
  "/xaut",
  "/dashboard"
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("viberisk_access_token")?.value;

  if (!accessToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/risk/:path*",
    "/btc-usdt/:path*",
    "/btc/:path*",
    "/eth/:path*",
    "/sol/:path*",
    "/bnb/:path*",
    "/xaut/:path*",
    "/dashboard/:path*"
  ]
};

