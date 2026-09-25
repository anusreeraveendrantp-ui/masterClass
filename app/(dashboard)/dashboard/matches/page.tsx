import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rankMatches, type UserProfile, type TimeSlot } from "@/lib/matching-engine";
import { MatchCard } from "@/components/features/matches/match-card";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const session = await auth();
  const userId = session!.user!.id;

  // Load current user profile
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
    availability: (currentUserData.enrollments.flatMap((e) => e.availability) as TimeSlot[]),
    avgRating:
      currentUserData.ratingsReceived.length > 0
        ? currentUserData.ratingsReceived.reduce((s, r) => s + r.score, 0) /
          currentUserData.ratingsReceived.length
        : 0,
  };

  // Load all other users who share at least one course
  const candidates = await db.user.findMany({
    where: {
      id: { not: userId },
      enrollments: { some: { courseId: { in: currentUser.courseIds } } },
    },
    include: {
      enrollments: { select: { courseId: true, availability: true } },
      ratingsReceived: { select: { score: true } },
    },
    take: 50,
  });

  const candidateProfiles: UserProfile[] = candidates.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    trustScore: u.trustScore,
    courseIds: u.enrollments.map((e) => e.courseId),
    availability: (u.enrollments.flatMap((e) => e.availability) as TimeSlot[]),
    avgRating:
      u.ratingsReceived.length > 0
        ? u.ratingsReceived.reduce((s, r) => s + r.score, 0) / u.ratingsReceived.length
        : 0,
  }));

  const matches = rankMatches(currentUser, candidateProfiles);

  // Enrich with course names
  const courseIds = [...new Set(matches.flatMap((m) => m.sharedCourseIds))];
  const courseMap = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, name: true, code: true },
  });
  const courseById = Object.fromEntries(courseMap.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Matches</h1>
        <p className="text-gray-500 mt-1">
          Ranked by compatibility — course overlap, schedule, and trust score
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium">No matches yet</p>
          <p className="text-sm mt-1">
            Enroll in courses and set your availability to get matched.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.user.id}
              match={match}
              sharedCourses={match.sharedCourseIds.map((id) => courseById[id]).filter(Boolean)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
