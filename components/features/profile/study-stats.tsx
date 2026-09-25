interface StudyStatsProps {
  sessionsHosted: number;
  sessionsJoined: number;
  coursesEnrolled: number;
}

export function StudyStats({ sessionsHosted, sessionsJoined, coursesEnrolled }: StudyStatsProps) {
  const stats = [
    { label: "Sessions Hosted", value: sessionsHosted },
    { label: "Sessions Joined", value: sessionsJoined },
    { label: "Courses Enrolled", value: coursesEnrolled },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-gray-100 p-4 text-center"
        >
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
