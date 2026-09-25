"use client";

import { useState } from "react";
import { enrollInCourse, unenrollFromCourse } from "@/lib/actions/profile";

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
}

interface Enrollment {
  courseId: string;
  availability: unknown;
}

interface CourseListProps {
  courses: Course[];
  enrolledIds: Set<string>;
  enrollments: Enrollment[];
}

export function CourseList({ courses, enrolledIds, enrollments: initialEnrollments }: CourseListProps) {
  const [enrolled, setEnrolled] = useState(new Set(enrolledIds));
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase())
  );

  // Group by department
  const byDept = filtered.reduce<Record<string, Course[]>>((acc, c) => {
    if (!acc[c.department]) acc[c.department] = [];
    acc[c.department].push(c);
    return acc;
  }, {});

  async function handleEnroll(courseId: string) {
    setLoading(courseId);
    const result = await enrollInCourse({ courseId, availability: [] });
    setLoading(null);
    if (result.success) setEnrolled((s) => new Set([...s, courseId]));
  }

  async function handleUnenroll(courseId: string) {
    setLoading(courseId);
    const result = await unenrollFromCourse(courseId);
    setLoading(null);
    if (result.success) {
      setEnrolled((s) => {
        const next = new Set(s);
        next.delete(courseId);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <input
        type="search"
        placeholder="Search courses…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search courses"
        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {Object.entries(byDept).map(([dept, deptCourses]) => (
        <div key={dept}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {dept}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {deptCourses.map((course) => {
              const isEnrolled = enrolled.has(course.id);
              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-3 transition-colors ${
                    isEnrolled ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {course.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{course.code}</p>
                  </div>
                  <button
                    onClick={() =>
                      isEnrolled ? handleUnenroll(course.id) : handleEnroll(course.id)
                    }
                    disabled={loading === course.id}
                    className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 ${
                      isEnrolled
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {loading === course.id
                      ? "…"
                      : isEnrolled
                      ? "Unenroll"
                      : "Enroll"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm">No courses match your search.</p>
      )}
    </div>
  );
}
