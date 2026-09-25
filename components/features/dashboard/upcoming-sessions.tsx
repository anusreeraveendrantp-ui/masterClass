import Link from "next/link";

interface Session {
  id: string;
  title: string;
  startTime: Date;
  course: { name: string; code: string };
  host: { name: string | null; image: string | null };
  _count: { participants: number };
}

export function UpcomingSessions({ sessions }: { sessions: Session[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Upcoming Sessions</h2>
        <Link href="/dashboard/sessions" className="text-xs text-indigo-600 hover:underline">
          View all
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          No upcoming sessions. <Link href="/dashboard/sessions" className="text-indigo-600 hover:underline">Browse sessions</Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/dashboard/sessions/${s.id}`}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="min-w-[48px] text-center bg-indigo-50 rounded-lg p-2">
                  <p className="text-xs text-indigo-500 font-medium">
                    {new Date(s.startTime).toLocaleDateString("en", { month: "short" })}
                  </p>
                  <p className="text-lg font-bold text-indigo-700">
                    {new Date(s.startTime).getDate()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {s.course.code} ·{" "}
                    {new Date(s.startTime).toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {s._count.participants} participant{s._count.participants !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
