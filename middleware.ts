import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import ROUTES from "./constants/routes";

const protectedRoutes = ["/profile", "/orders", "/cart", "/wishlist"];
const adminRoutes = ["/dashboard"];
const publicApiRoutes = [
  "/api/accounts/provider",
  "/api/accounts/:id",
  "/api/auth",
  "/api/users/email",
  "/api/users/:id",
  "/api/ping",
];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Handle wildcard patterns
    const pattern = route.replace(/:\w+\*/g, ".*").replace(/:\w+/g, "[^/]+");
    const regex = new RegExp(`^${pattern}`);
    return regex.test(pathname);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const ua = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";

  const isInAppBrowser =
    /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|Pinterest/i.test(ua) ||
    referer.includes("tiktok.com") ||
    /(wv|WebView)/i.test(ua);

  if (isInAppBrowser && pathname.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/open-in-browser", request.url));
  }

  if (!isInAppBrowser && pathname === "/open-in-browser") {
    return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
  }

  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) {
    if (matchesRoute(pathname, publicApiRoutes)) {
      return NextResponse.next();
    }
    const session = await auth();
    if (session?.user.role === "admin") {
      return NextResponse.next();
    }
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (matchesRoute(pathname, protectedRoutes)) {
    const session = await auth();
    if (!session?.user?.id) {
      const signInUrl = new URL(ROUTES.SIGN_IN, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (matchesRoute(pathname, adminRoutes)) {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      const signInUrl = new URL(ROUTES.SIGN_IN, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const session = await auth();

  if (session?.user) {
    if (session.user.role === "admin" && pathname === ROUTES.SIGN_IN) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (session.user.role === "user" && pathname === ROUTES.SIGN_IN) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  runtime: "nodejs",
};
