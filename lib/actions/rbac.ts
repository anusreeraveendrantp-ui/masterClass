"use server";

import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/actions/auth";

export type Role = "STUDENT" | "ORGANIZER" | "ADMIN";

/**
 * Asserts the caller is authenticated.
 * Returns the session on success or an ActionResult error.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: { success: false, error: "Unauthorized" } as ActionResult };
  }
  return { session, error: null };
}

/**
 * Asserts the caller has one of the required roles.
 * Usage:
 *   const { session, error } = await requireRole("ADMIN");
 *   if (error) return error;
 */
export async function requireRole(...roles: Role[]) {
  const { session, error } = await requireAuth();
  if (error || !session) return { session: null, error: error ?? { success: false, error: "Unauthorized" } as ActionResult };

  const userRole = session.user.role as Role;
  if (!roles.includes(userRole)) {
    return {
      session: null,
      error: { success: false, error: "Forbidden: insufficient permissions" } as ActionResult,
    };
  }
  return { session, error: null };
}
