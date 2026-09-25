import { NextRequest, NextResponse } from "next/server";
import { authConfigured, validAuthToken } from "./app/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // The public shop-window: Overview is always visible without a login.
  const requestedScreen = searchParams.get("screen");
  const isPublicOverview = pathname === "/" && (!requestedScreen || requestedScreen === "gettingstarted");
  if (isPublicOverview) return NextResponse.next();

  // Everything beyond Overview remains protected.
  if (!authConfigured()) {
    const url = request.nextUrl.clone();
    const next = `${pathname}${request.nextUrl.search}`;
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get("alumni_aiops_auth")?.value;
  if (await validAuthToken(token)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const next = `${pathname}${request.nextUrl.search}`;
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
