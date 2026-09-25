"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Course {
  id: string;
  name: string;
  code: string;
}

export function SessionFilters({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Filter by course"
        value={searchParams.get("course") ?? ""}
        onChange={(e) => updateParam("course", e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Courses</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} — {c.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by status"
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Upcoming & Active</option>
        <option value="UPCOMING">Upcoming</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}
