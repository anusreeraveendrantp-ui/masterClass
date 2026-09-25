import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const enrollmentSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  availability: z
    .array(
      z.object({
        day: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]),
        start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
      })
    )
    .default([]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
