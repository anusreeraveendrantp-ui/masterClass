import { getTrustLabel } from "@/lib/trust-score";

interface DashboardStatsProps {
  trustScore: number;
  totalSessions: number;
  coursesEnrolled: number;
  upcomingCount: number;
}

export function DashboardStats({
  trustScore,
  totalSessions,
  coursesEnrolled,
  upcomingCount,
}: DashboardStatsProps) {
  const { label, color } = getTrustLabel(trustScore);

  const stats = [
    {
      label: "Trust Score",
      value: `${trustScore.toFixed(0)}`,
      sub: label,
      
      valueColor: color,
    },
    {
      label: "Sessions Attended",
      value: totalSessions.toString(),
      sub: "all time",
      
      valueColor: "text-gray-900",
    },
    {
      label: "Courses Enrolled",
      value: coursesEnrolled.toString(),
      sub: "active",
     
      valueColor: "text-gray-900",
    },
    {
      label: "Upcoming Sessions",
      value: upcomingCount.toString(),
      sub: "scheduled",
     
      valueColor: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, sub, valueColor }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
        >
         
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      ))}
    </div>
  );
}
