import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const publicRoutes = ["/", "/login", "/register"];

      if (publicRoutes.includes(pathname)) {
        return true;
      }

      if (pathname.startsWith("/api/auth")) {
        return true;
      }

      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
