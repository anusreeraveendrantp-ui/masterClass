/**
 * Trust Score System
 *
 * Score range: 0 – 100
 * Starting score: 50
 *
 * Factors:
 *  - Attendance: +8 per attended session, -12 per no-show
 *  - Peer ratings: weighted toward recent ratings
 *  - Inactivity decay: -2 per week without any session activity (capped at -20)
 */

export const TRUST_SCORE = {
  INITIAL: 50,
  MIN: 0,
  MAX: 100,
  ATTENDED_BONUS: 8,
  NO_SHOW_PENALTY: 12,
  INACTIVITY_DECAY_PER_WEEK: 2,
  MAX_INACTIVITY_DECAY: 20,
} as const;

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Recalculate trust score after a session.
 * @param currentScore  Existing trust score (0-100)
 * @param attended      Whether the user attended
 * @param ratings       Array of rating scores (1-5) received in this session
 * @param lastSessionAt Date of the previous session (for decay calculation)
 */
export function recalculateTrustScore(
  currentScore: number,
  attended: boolean,
  ratings: number[],
  lastSessionAt: Date | null
): number {
  let score = currentScore;

  // Attendance bonus/penalty
  if (attended) {
    score += TRUST_SCORE.ATTENDED_BONUS;
  } else {
    score -= TRUST_SCORE.NO_SHOW_PENALTY;
  }

  // Peer rating influence (each rating moves score by ±2 relative to midpoint 3)
  for (const r of ratings) {
    const delta = (r - 3) * 2; // -4 to +4 per rating
    score += delta;
  }

  // Inactivity decay since last session
  if (lastSessionAt) {
    const weeksInactive = Math.floor(
      (Date.now() - lastSessionAt.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    const decay = Math.min(
      weeksInactive * TRUST_SCORE.INACTIVITY_DECAY_PER_WEEK,
      TRUST_SCORE.MAX_INACTIVITY_DECAY
    );
    score -= decay;
  }

  return clamp(Math.round(score * 10) / 10, TRUST_SCORE.MIN, TRUST_SCORE.MAX);
}

/** Format trust score as a human-readable label */
export function getTrustLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) return { label: "Excellent", color: "text-green-600" };
  if (score >= 65) return { label: "Good", color: "text-emerald-500" };
  if (score >= 50) return { label: "Fair", color: "text-yellow-500" };
  if (score >= 35) return { label: "Low", color: "text-orange-500" };
  return { label: "Poor", color: "text-red-600" };
}
