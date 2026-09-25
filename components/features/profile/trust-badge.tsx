import { getTrustLabel } from "@/lib/trust-score";

interface TrustBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function TrustBadge({ score, size = "md" }: TrustBadgeProps) {
  const { label, color } = getTrustLabel(score);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const scoreSize = {
    sm: "text-sm font-bold",
    md: "text-xl font-bold",
    lg: "text-3xl font-bold",
  };

  if (size === "sm") {
    return (
      <span
        className={`${sizeClasses.sm} bg-gray-100 rounded-full font-medium ${color}`}
        title={`Trust score: ${score}`}
        aria-label={`Trust score: ${score} — ${label}`}
      >
        ⭐ {score.toFixed(0)}
      </span>
    );
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center min-w-[80px]"
      aria-label={`Trust score: ${score} — ${label}`}
    >
      <p className={`${scoreSize[size]} ${color}`}>{score.toFixed(0)}</p>
      <p className="text-xs text-gray-500 mt-0.5">Trust · {label}</p>
    </div>
  );
}
