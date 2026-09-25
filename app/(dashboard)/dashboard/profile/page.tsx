import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/features/profile/profile-form";
import { TrustBadge } from "@/components/features/profile/trust-badge";
import { StudyStats } from "@/components/features/profile/study-stats";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: { include: { course: { select: { name: true, code: true } } } },
      ratingsReceived: { select: { score: true } },
      _count: {
        select: {
          hostedSessions: true,
          participations: true,
        },
      },
    },
  });

  if (!user) return null;

  const avgRating =
    user.ratingsReceived.length > 0
      ? user.ratingsReceived.reduce((s, r) => s + r.score, 0) /
        user.ratingsReceived.length
      : null;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account and availability</p>
      </div>

      <div className="flex gap-4">
        <TrustBadge score={user.trustScore} size="lg" />
        {avgRating && (
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Avg Rating</p>
          </div>
        )}
      </div>

      <StudyStats
        sessionsHosted={user._count.hostedSessions}
        sessionsJoined={user._count.participations}
        coursesEnrolled={user.enrollments.length}
      />

      <ProfileForm user={{ id: user.id, name: user.name, email: user.email, image: user.image }} />
    </div>
  );
}
