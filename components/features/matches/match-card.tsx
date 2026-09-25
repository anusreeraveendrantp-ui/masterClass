import { getTrustLabel } from "@/lib/trust-score";
import type { MatchResult } from "@/lib/matching-engine";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface MatchCardProps {
  match: MatchResult;
  sharedCourses: Course[];
}

export function MatchCard({ match, sharedCourses }: MatchCardProps) {
  const { user, score, breakdown } = match;
  const { label, color } = getTrustLabel(user.trustScore);

  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* User info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold shrink-0">
          {user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
          <p className={`text-sm ${color}`}>{user.trustScore.toFixed(0)} · {label}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-extrabold text-indigo-600">{score}</p>
          <p className="text-xs text-gray-400">match</p>
        </div>
      </div>

      {/* Shared courses */}
      {sharedCourses.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {sharedCourses.map((c) => (
            <span
              key={c.id}
              className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium"
            >
              {c.code}
            </span>
          ))}
        </div>
      )}

      {/* Score breakdown */}
      <div className="space-y-2">
        <ScoreBar label="Course Overlap" value={breakdown.courseOverlap} />
        <ScoreBar label="Availability" value={breakdown.availabilityOverlap} />
        <ScoreBar label="Trust" value={breakdown.trustScore} />
        <ScoreBar label="Rating Compat." value={breakdown.ratingCompatibility} />
      </div>
    </article>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-400 rounded-full transition-all"
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value}%`}
        />
      </div>
    </div>
  );
}
