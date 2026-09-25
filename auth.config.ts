import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const AUTH_ROUTES = ["/login", "/register"];
const ADMIN_ROUTES = ["/dashboard/admin"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Always allow static assets and NextAuth API routes
      if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/public")
      ) {
        return true;
      }

      // Redirect logged-in users away from login/register
      if (isLoggedIn && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }

      // Protect all non-public routes
      if (!isLoggedIn && !PUBLIC_ROUTES.some((r) => pathname === r)) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Role-based: admin routes require ADMIN role
      if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
        const role = (auth?.user as { role?: string })?.role;
        if (role !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
