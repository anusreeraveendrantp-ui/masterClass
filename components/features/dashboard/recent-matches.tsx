import Link from "next/link";
import { db } from "@/lib/db";
import { rankMatches, type UserProfile, type TimeSlot } from "@/lib/matching-engine";
import { getTrustLabel } from "@/lib/trust-score";

export async function RecentMatches({ userId }: { userId: string }) {
  const currentUserData = await db.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: { select: { courseId: true, availability: true } },
      ratingsReceived: { select: { score: true } },
    },
  });

  if (!currentUserData) return null;

  const currentUser: UserProfile = {
    id: currentUserData.id,
    name: currentUserData.name,
    image: currentUserData.image,
    trustScore: currentUserData.trustScore,
    courseIds: currentUserData.enrollments.map((e) => e.courseId),
    availability: currentUserData.enrollments.flatMap((e) => e.availability) as TimeSlot[],
    avgRating: 0,
  };

  if (currentUser.courseIds.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Top Matches</h2>
        <p className="text-sm text-gray-400 py-4 text-center">
          <Link href="/dashboard/courses" className="text-indigo-600 hover:underline">
            Enroll in courses
          </Link>{" "}
          to see your matches.
        </p>
      </div>
    );
  }

  const candidates = await db.user.findMany({
    where: {
      id: { not: userId },
      enrollments: { some: { courseId: { in: currentUser.courseIds } } },
    },
    include: {
      enrollments: { select: { courseId: true, availability: true } },
      ratingsReceived: { select: { score: true } },
    },
    take: 20,
  });

  const profiles: UserProfile[] = candidates.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    trustScore: u.trustScore,
    courseIds: u.enrollments.map((e) => e.courseId),
    availability: u.enrollments.flatMap((e) => e.availability) as TimeSlot[],
    avgRating: u.ratingsReceived.length
      ? u.ratingsReceived.reduce((s, r) => s + r.score, 0) / u.ratingsReceived.length
      : 0,
  }));

  const matches = rankMatches(currentUser, profiles).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Top Matches</h2>
        <Link href="/dashboard/matches" className="text-xs text-indigo-600 hover:underline">
          See all
        </Link>
      </div>

      {matches.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No matches found yet.</p>
      ) : (
        <ul className="space-y-3">
          {matches.map(({ user, score }) => {
            const { color } = getTrustLabel(user.trustScore);
            return (
              <li key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className={`text-xs ${color}`}>Trust {user.trustScore.toFixed(0)}</p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {score}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
