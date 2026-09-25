import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CourseList } from "@/components/features/courses/course-list";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [allCourses, enrollments] = await Promise.all([
    db.course.findMany({ orderBy: [{ department: "asc" }, { name: "asc" }] }),
    db.enrollment.findMany({
      where: { userId },
      select: { courseId: true, availability: true },
    }),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-500 mt-1">
          Enroll in courses to unlock matching and session discovery
        </p>
      </div>
      <CourseList courses={allCourses} enrolledIds={enrolledIds} enrollments={enrollments} />
    </div>
  );
}
