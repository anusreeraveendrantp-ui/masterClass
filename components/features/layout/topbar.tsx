import type { Session } from "next-auth";
import { TrustBadge } from "@/components/features/profile/trust-badge";

interface TopBarProps {
  user: Session["user"] & { trustScore?: number };
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-end gap-4">
      {typeof user?.trustScore === "number" && (
        <TrustBadge score={user.trustScore} size="sm" />
      )}
      <div className="flex items-center gap-2">
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "Avatar"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold"
            aria-hidden="true"
          >
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
      </div>
    </header>
  );
}
