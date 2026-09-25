"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/actions/rbac";
import type { ActionResult } from "@/lib/actions/auth";
import type { Role } from "@/lib/actions/rbac";

/** List all users — ADMIN only */
export async function listUsers() {
  const { error } = await requireRole("ADMIN");
  if (error) return { success: false as const, error: !error.success ? error.error : "Unauthorized", users: [] };

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trustScore: true,
      createdAt: true,
      _count: {
        select: { hostedSessions: true, participations: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true as const, users };
}

/** Change a user's role — ADMIN only */
export async function changeUserRole(
  targetUserId: string,
  newRole: Role
): Promise<ActionResult> {
  const { session, error } = await requireRole("ADMIN");
  if (error || !session) return error ?? { success: false, error: "Unauthorized" };

  // Prevent admins from demoting themselves
  if (targetUserId === session.user.id) {
    return { success: false, error: "You cannot change your own role." };
  }

  const target = await db.user.findUnique({ where: { id: targetUserId } });
  if (!target) return { success: false, error: "User not found." };

  await db.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  revalidatePath("/dashboard/admin");

  return { success: true, message: `Role updated to ${newRole}.` };
}

/** Delete a user account — ADMIN only */
export async function deleteUser(targetUserId: string): Promise<ActionResult> {
  const { session, error } = await requireRole("ADMIN");
  if (error || !session) return error ?? { success: false, error: "Unauthorized" };

  if (targetUserId === session.user.id) {
    return { success: false, error: "You cannot delete your own account." };
  }

  const target = await db.user.findUnique({ where: { id: targetUserId } });
  if (!target) return { success: false, error: "User not found." };

  await db.user.delete({ where: { id: targetUserId } });

  revalidatePath("/dashboard/admin");

  return { success: true, message: "User deleted." };
}

/** Get platform-wide stats — ADMIN only */
export async function getAdminStats() {
  const { error } = await requireRole("ADMIN");
  if (error) return null;

  const [totalUsers, totalSessions, activeSessions, totalRatings] = await Promise.all([
    db.user.count(),
    db.studySession.count(),
    db.studySession.count({ where: { status: { in: ["UPCOMING", "ACTIVE"] } } }),
    db.rating.count(),
  ]);

  const roleBreakdown = await db.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });

  return {
    totalUsers,
    totalSessions,
    activeSessions,
    totalRatings,
    roleBreakdown: roleBreakdown.map((r) => ({ role: r.role, count: r._count.role })),
  };
}
