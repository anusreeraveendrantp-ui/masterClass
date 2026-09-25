"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  updateProfileSchema,
  enrollmentSchema,
  type UpdateProfileInput,
  type EnrollmentInput,
} from "@/lib/validators/profile";
import type { ActionResult } from "@/lib/actions/auth";

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/profile");

  return { success: true, message: "Profile updated." };
}

export async function enrollInCourse(
  input: EnrollmentInput
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const parsed = enrollmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { courseId, availability } = parsed.data;

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false, error: "Course not found." };

  await db.enrollment.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    create: { userId: session.user.id, courseId, availability },
    update: { availability },
  });

  revalidatePath("/dashboard/courses");

  return { success: true, message: `Enrolled in ${course.name}.` };
}

export async function unenrollFromCourse(
  courseId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  await db.enrollment.deleteMany({
    where: { userId: session.user.id, courseId },
  });

  revalidatePath("/dashboard/courses");

  return { success: true, message: "Unenrolled from course." };
}
