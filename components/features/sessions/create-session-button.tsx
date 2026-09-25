"use client";

import { useState } from "react";
import { createSession } from "@/lib/actions/sessions";
import { createSessionSchema } from "@/lib/validators/session";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  name: string;
  code: string;
}

export function CreateSessionButton({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    maxCapacity: 10,
  });

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = createSessionSchema.safeParse({
      ...form,
      maxCapacity: Number(form.maxCapacity),
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    const result = await createSession(parsed.data);
    setLoading(false);

    if (result.success) {
      setOpen(false);
      router.push(`/dashboard/sessions/${result.sessionId}`);
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
      >
        + New Session
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-session-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 id="create-session-title" className="font-bold text-lg text-gray-900">
                Create Study Session
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-4xl">📚</p>
                <p className="text-sm font-medium text-gray-700">No courses available yet</p>
                <p className="text-xs text-gray-400">
                  Ask your admin to add courses, or go to the{" "}
                  <a href="/dashboard/courses" className="text-indigo-600 hover:underline">
                    Courses page
                  </a>{" "}
                  to enroll first.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cs-course" className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  id="cs-course"
                  required
                  value={form.courseId}
                  onChange={(e) => setField("courseId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a course…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cs-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="cs-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Calculus Chapter 5 Review"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cs-start" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    id="cs-start"
                    type="datetime-local"
                    required
                    value={form.startTime}
                    onChange={(e) => setField("startTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="cs-end" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    id="cs-end"
                    type="datetime-local"
                    required
                    value={form.endTime}
                    onChange={(e) => setField("endTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cs-location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location / Link (optional)
                </label>
                <input
                  id="cs-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Room 204 or https://meet.google.com/..."
                />
              </div>

              <div>
                <label htmlFor="cs-capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Participants
                </label>
                <input
                  id="cs-capacity"
                  type="number"
                  min={2}
                  max={50}
                  value={form.maxCapacity}
                  onChange={(e) => setField("maxCapacity", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {loading ? "Creating…" : "Create Session"}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
