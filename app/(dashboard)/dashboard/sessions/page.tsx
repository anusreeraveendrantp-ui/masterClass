import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SessionCard } from "@/components/features/sessions/session-card";
import { CreateSessionButton } from "@/components/features/sessions/create-session-button";
import { SessionFilters } from "@/components/features/sessions/session-filters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ course?: string; status?: string }>;
}

export default async function SessionsPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session!.user!.id;
  const { course, status } = await searchParams;

  const sessions = await db.studySession.findMany({
    where: {
      ...(course ? { courseId: course } : {}),
      ...(status ? { status: status as "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED" } : { status: { in: ["UPCOMING", "ACTIVE"] } }),
    },
    include: {
      course: { select: { name: true, code: true } },
      host: { select: { id: true, name: true, image: true, trustScore: true } },
      _count: { select: { participants: true } },
      participants: { where: { userId }, select: { status: true } },
    },
    orderBy: { startTime: "asc" },
    take: 20,
  });

  const courses = await db.course.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Sessions</h1>
          <p className="text-gray-500 mt-1">Browse and join upcoming sessions</p>
        </div>
        <CreateSessionButton courses={courses} />
      </div>

      <SessionFilters courses={courses} />

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-lg font-medium">No sessions found</p>
          <p className="text-sm mt-1">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              currentUserId={userId}
              isParticipant={s.participants.length > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
