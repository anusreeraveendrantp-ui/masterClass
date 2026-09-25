"use client";

import { useState } from "react";
import { changeUserRole, deleteUser } from "@/lib/actions/admin";
import type { Role } from "@/lib/actions/rbac";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  trustScore: number;
  createdAt: Date;
  _count: { hostedSessions: number; participations: number };
}

interface AdminUserTableProps {
  users: User[];
  currentUserId: string;
}

const ROLES: Role[] = ["STUDENT", "ORGANIZER", "ADMIN"];

export function AdminUserTable({ users, currentUserId }: AdminUserTableProps) {
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: Role) {
    setLoading(userId);
    setMsg(null);
    const result = await changeUserRole(userId, newRole);
    setLoading(null);
    setMsg({ id: userId, text: result.success ? result.message : result.error, ok: result.success });
  }

  async function handleDelete(userId: string, name: string | null) {
    if (!confirm(`Delete user "${name ?? "this user"}"? This cannot be undone.`)) return;
    setLoading(userId + "-delete");
    setMsg(null);
    const result = await deleteUser(userId);
    setLoading(null);
    setMsg({ id: userId, text: result.success ? result.message : result.error, ok: result.success });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">User Management</h2>
        <p className="text-xs text-gray-400 mt-0.5">{users.length} users total</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Trust</th>
              <th className="px-6 py-3">Sessions</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isLoadingRole = loading === user.id;
              const isLoadingDelete = loading === user.id + "-delete";
              const feedback = msg?.id === user.id ? msg : null;

              return (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${isSelf ? "bg-indigo-50/30" : ""}`}>
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.name ?? "—"}
                          {isSelf && <span className="ml-2 text-xs text-indigo-400">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role selector */}
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      disabled={isSelf || isLoadingRole}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.role === "ADMIN"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : user.role === "ORGANIZER"
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                      aria-label={`Role for ${user.name ?? user.email}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {feedback && (
                      <p className={`text-xs mt-1 ${feedback.ok ? "text-green-600" : "text-red-600"}`}>
                        {feedback.text}
                      </p>
                    )}
                  </td>

                  {/* Trust score */}
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {user.trustScore.toFixed(0)}
                  </td>

                  {/* Sessions */}
                  <td className="px-6 py-4 text-gray-500">
                    <span title="Hosted">{user._count.hostedSessions} hosted</span>
                    {" · "}
                    <span title="Joined">{user._count.participations} joined</span>
                  </td>

                  {/* Joined date */}
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  {/* Delete */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      disabled={isSelf || isLoadingDelete}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label={`Delete ${user.name ?? user.email}`}
                    >
                      {isLoadingDelete ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
