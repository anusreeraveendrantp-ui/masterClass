import { describe, it, expect } from "vitest";
import { rankMatches, type UserProfile } from "@/lib/matching-engine";

const baseUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: "user-1",
  name: "Test User",
  image: null,
  trustScore: 70,
  courseIds: ["course-a", "course-b"],
  availability: [{ day: "MON", start: "10:00", end: "12:00" }],
  avgRating: 4,
  ...overrides,
});

describe("rankMatches", () => {
  it("returns empty array when no candidates", () => {
    expect(rankMatches(baseUser(), [])).toEqual([]);
  });

  it("excludes the current user from results", () => {
    const me = baseUser({ id: "me" });
    const results = rankMatches(me, [me]);
    expect(results).toHaveLength(0);
  });

  it("ranks candidate with full course overlap higher", () => {
    const me = baseUser({ id: "me", courseIds: ["a", "b"] });
    const highMatch = baseUser({ id: "high", courseIds: ["a", "b"], trustScore: 80 });
    const lowMatch = baseUser({ id: "low", courseIds: ["c", "d"], trustScore: 80 });
    const results = rankMatches(me, [lowMatch, highMatch]);
    expect(results[0].user.id).toBe("high");
  });

  it("returns a score between 0 and 100", () => {
    const me = baseUser({ id: "me" });
    const candidate = baseUser({ id: "cand", courseIds: ["course-a"] });
    const results = rankMatches(me, [candidate]);
    expect(results[0].score).toBeGreaterThanOrEqual(0);
    expect(results[0].score).toBeLessThanOrEqual(100);
  });

  it("identifies shared course IDs correctly", () => {
    const me = baseUser({ id: "me", courseIds: ["a", "b", "c"] });
    const candidate = baseUser({ id: "cand", courseIds: ["b", "c", "d"] });
    const results = rankMatches(me, [candidate]);
    expect(results[0].sharedCourseIds).toEqual(expect.arrayContaining(["b", "c"]));
    expect(results[0].sharedCourseIds).toHaveLength(2);
  });

  it("scores availability overlap when slots match", () => {
    const me = baseUser({ id: "me", courseIds: ["a"], availability: [{ day: "MON", start: "09:00", end: "11:00" }] });
    const withOverlap = baseUser({ id: "overlap", courseIds: ["a"], availability: [{ day: "MON", start: "10:00", end: "12:00" }] });
    const noOverlap = baseUser({ id: "no-overlap", courseIds: ["a"], availability: [{ day: "TUE", start: "10:00", end: "12:00" }] });
    const results = rankMatches(me, [withOverlap, noOverlap]);
    const overlapResult = results.find(r => r.user.id === "overlap")!;
    const noOverlapResult = results.find(r => r.user.id === "no-overlap")!;
    expect(overlapResult.breakdown.availabilityOverlap).toBeGreaterThan(noOverlapResult.breakdown.availabilityOverlap);
  });

  it("results are sorted descending by score", () => {
    const me = baseUser({ id: "me", courseIds: ["a", "b", "c"] });
    const candidates = [
      baseUser({ id: "c1", courseIds: ["a"], trustScore: 40 }),
      baseUser({ id: "c2", courseIds: ["a", "b", "c"], trustScore: 90 }),
      baseUser({ id: "c3", courseIds: ["a", "b"], trustScore: 60 }),
    ];
    const results = rankMatches(me, candidates);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
    }
  });
});
