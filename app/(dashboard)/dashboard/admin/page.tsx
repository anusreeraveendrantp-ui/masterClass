import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUsers, getAdminStats } from "@/lib/actions/admin";
import { AdminUserTable } from "@/components/features/admin/admin-user-table";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  // Double-check at page level — proxy handles this too, but defence in depth
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [usersResult, stats] = await Promise.all([
    listUsers(),
    getAdminStats(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Manage users and monitor platform activity.</p>
      </div>

      {/* Platform stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers },
            { label: "Total Sessions", value: stats.totalSessions },
            { label: "Active Sessions", value: stats.activeSessions },
            { label: "Total Ratings", value: stats.totalRatings },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Role breakdown */}
      {stats && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Users by Role</h2>
          <div className="flex gap-6">
            {stats.roleBreakdown.map(({ role, count }) => (
              <div key={role}>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  role === "ADMIN"
                    ? "bg-red-100 text-red-700"
                    : role === "ORGANIZER"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {role}
                </span>
                <span className="ml-2 text-sm font-medium text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User management table */}
      {usersResult.success ? (
        <AdminUserTable users={usersResult.users} currentUserId={session.user.id} />
      ) : (
        <p className="text-red-600 text-sm">{usersResult.error}</p>
      )}
    </div>
  );
}
