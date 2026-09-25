import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Run on all routes except static assets and images.
  // Importantly, /api/auth/* is NOT excluded so NextAuth session endpoints work.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
