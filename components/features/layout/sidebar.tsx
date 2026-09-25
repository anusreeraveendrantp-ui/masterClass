"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/matches", label: "Matches", icon: "🎯" },
  { href: "/dashboard/sessions", label: "Sessions", icon: "📅" },
  { href: "/dashboard/courses", label: "Courses", icon: "📚" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
];

interface SidebarProps {
  user: Session["user"];
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-indigo-600">StudySync</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span aria-hidden="true">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
