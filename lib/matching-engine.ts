/**
 * StudySync Matching Engine
 *
 * Scores potential study partners using a weighted combination of:
 *  - Course overlap       (40%) — shared enrolled courses
 *  - Availability overlap (30%) — overlapping free time slots
 *  - Trust score          (20%) — peer-rated reliability
 *  - Rating compatibility (10%) — similarity of received ratings
 */

export type TimeSlot = {
  day: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
};

export type UserProfile = {
  id: string;
  name: string | null;
  image: string | null;
  trustScore: number;
  courseIds: string[];
  availability: TimeSlot[];
  avgRating: number; // average rating received, 0-5
};

export type MatchResult = {
  user: UserProfile;
  score: number; // 0-100
  breakdown: {
    courseOverlap: number;
    availabilityOverlap: number;
    trustScore: number;
    ratingCompatibility: number;
  };
  sharedCourseIds: string[];
};

const WEIGHTS = {
  courseOverlap: 0.4,
  availabilityOverlap: 0.3,
  trustScore: 0.2,
  ratingCompatibility: 0.1,
};

/** Convert "HH:MM" to minutes since midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Calculate overlap in minutes between two time slots on the same day */
function slotOverlapMinutes(a: TimeSlot, b: TimeSlot): number {
  if (a.day !== b.day) return 0;
  const aStart = toMinutes(a.start);
  const aEnd = toMinutes(a.end);
  const bStart = toMinutes(b.start);
  const bEnd = toMinutes(b.end);
  const overlapStart = Math.max(aStart, bStart);
  const overlapEnd = Math.min(aEnd, bEnd);
  return Math.max(0, overlapEnd - overlapStart);
}

/** Score course overlap: proportion of target user's courses matched */
function scoreCourseOverlap(
  myCourseIds: string[],
  theirCourseIds: string[]
): { score: number; shared: string[] } {
  if (myCourseIds.length === 0) return { score: 0, shared: [] };
  const mySet = new Set(myCourseIds);
  const shared = theirCourseIds.filter((id) => mySet.has(id));
  const score = (shared.length / myCourseIds.length) * 100;
  return { score: Math.min(100, score), shared };
}

/** Score availability overlap: total overlapping minutes normalised to 0-100 */
function scoreAvailabilityOverlap(
  mySlots: TimeSlot[],
  theirSlots: TimeSlot[]
): number {
  if (mySlots.length === 0 || theirSlots.length === 0) return 0;
  let totalOverlap = 0;
  for (const a of mySlots) {
    for (const b of theirSlots) {
      totalOverlap += slotOverlapMinutes(a, b);
    }
  }
  // Normalize: 120 min of overlap = 100 score
  return Math.min(100, (totalOverlap / 120) * 100);
}

/** Score trust: trustScore is 0-100 already */
function scoreTrust(trustScore: number): number {
  return Math.min(100, Math.max(0, trustScore));
}

/** Score rating compatibility: compare avg ratings, closer = higher score */
function scoreRatingCompatibility(
  myAvgRating: number,
  theirAvgRating: number
): number {
  if (myAvgRating === 0 || theirAvgRating === 0) return 50; // neutral if no data
  const diff = Math.abs(myAvgRating - theirAvgRating);
  // max diff is 4 (1 vs 5), linearly scale to 0-100
  return Math.max(0, 100 - (diff / 4) * 100);
}

/**
 * Rank a list of candidate users against the current user.
 * Returns sorted descending by composite score.
 */
export function rankMatches(
  currentUser: UserProfile,
  candidates: UserProfile[]
): MatchResult[] {
  const results: MatchResult[] = candidates
    .filter((c) => c.id !== currentUser.id)
    .map((candidate) => {
      const { score: courseScore, shared } = scoreCourseOverlap(
        currentUser.courseIds,
        candidate.courseIds
      );
      const availScore = scoreAvailabilityOverlap(
        currentUser.availability,
        candidate.availability
      );
      const trustScoreVal = scoreTrust(candidate.trustScore);
      const ratingScore = scoreRatingCompatibility(
        currentUser.avgRating,
        candidate.avgRating
      );

      const composite =
        courseScore * WEIGHTS.courseOverlap +
        availScore * WEIGHTS.availabilityOverlap +
        trustScoreVal * WEIGHTS.trustScore +
        ratingScore * WEIGHTS.ratingCompatibility;

      return {
        user: candidate,
        score: Math.round(composite * 10) / 10,
        breakdown: {
          courseOverlap: Math.round(courseScore),
          availabilityOverlap: Math.round(availScore),
          trustScore: Math.round(trustScoreVal),
          ratingCompatibility: Math.round(ratingScore),
        },
        sharedCourseIds: shared,
      };
    });

  return results.sort((a, b) => b.score - a.score);
}
