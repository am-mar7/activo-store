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
];

// Check if a path matches any pattern in the array
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

  // Check if it's an API route
  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) {
    // Allow public API routes
    if (matchesRoute(pathname, publicApiRoutes)) {
      return NextResponse.next();
    }
    const session = await auth();
    if (session?.user.role === "admin") {
      return NextResponse.next();
    }
    // Protect all other API routes
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Handle protected page routes
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
    console.log(session?.user);

    if (session?.user?.role !== "admin") {
      const signInUrl = new URL(ROUTES.SIGN_IN, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
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
