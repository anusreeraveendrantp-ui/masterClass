import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardStats } from "@/components/features/dashboard/dashboard-stats";
import { UpcomingSessions } from "@/components/features/dashboard/upcoming-sessions";
import { RecentMatches } from "@/components/features/dashboard/recent-matches";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  const [user, upcomingSessions, totalSessions, coursesEnrolled] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { trustScore: true, name: true },
      }),
      db.studySession.findMany({
        where: {
          participants: { some: { userId } },
          status: { in: ["UPCOMING", "ACTIVE"] },
          startTime: { gte: new Date() },
        },
        include: {
          course: { select: { name: true, code: true } },
          host: { select: { name: true, image: true } },
          _count: { select: { participants: true } },
        },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      db.studySession.count({
        where: {
          participants: { some: { userId, status: "ATTENDED" } },
        },
      }),
      db.enrollment.count({ where: { userId } }),
    ]);

  return { user, upcomingSessions, totalSessions, coursesEnrolled };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const { user, upcomingSessions, totalSessions, coursesEnrolled } =
    await getDashboardData(userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your studies.</p>
      </div>

      <DashboardStats
        trustScore={user?.trustScore ?? 50}
        totalSessions={totalSessions}
        coursesEnrolled={coursesEnrolled}
        upcomingCount={upcomingSessions.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingSessions sessions={upcomingSessions} />
        <RecentMatches userId={userId} />
      </div>
    </div>
  );
}
