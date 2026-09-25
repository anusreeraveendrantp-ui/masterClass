import { z } from "zod";

const sessionFields = {
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  startTime: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Invalid start time",
  }),
  endTime: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Invalid end time",
  }),
  location: z.string().optional(),
  maxCapacity: z.number().int().min(2).max(50).default(10),
};

const sessionBaseSchema = z.object(sessionFields);

export const createSessionSchema = sessionBaseSchema.refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const updateSessionSchema = sessionBaseSchema.partial();

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;