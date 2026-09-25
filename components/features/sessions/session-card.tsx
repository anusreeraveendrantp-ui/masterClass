"use client";

import Link from "next/link";
import { useState } from "react";
import { joinSession } from "@/lib/actions/sessions";
import { getTrustLabel } from "@/lib/trust-score";

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    location: string | null;
    maxCapacity: number;
    status: string;
    course: { name: string; code: string };
    host: { id: string; name: string | null; image: string | null; trustScore: number };
    _count: { participants: number };
  };
  currentUserId: string;
  isParticipant: boolean;
}

export function SessionCard({ session, currentUserId, isParticipant }: SessionCardProps) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(isParticipant);
  const [error, setError] = useState("");

  const { color } = getTrustLabel(session.host.trustScore);
  const spotsLeft = session.maxCapacity - session._count.participants;
  const isHost = session.host.id === currentUserId;
  const isPast = new Date(session.endTime) < new Date();

  async function handleJoin() {
    setJoining(true);
    setError("");
    const result = await joinSession(session.id);
    setJoining(false);
    if (result.success) {
      setJoined(true);
    } else {
      setError(result.error);
    }
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {session.course.code}
          </span>
          <Link
            href={`/dashboard/sessions/${session.id}`}
            className="block mt-1 font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {session.title}
          </Link>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
            session.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : session.status === "COMPLETED"
              ? "bg-gray-100 text-gray-500"
              : session.status === "CANCELLED"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {session.status}
        </span>
      </div>

      {/* Time */}
      <div className="text-sm text-gray-500">
        <p>
          📅{" "}
          {new Date(session.startTime).toLocaleDateString("en", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          ·{" "}
          {new Date(session.startTime).toLocaleTimeString("en", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          –{" "}
          {new Date(session.endTime).toLocaleTimeString("en", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {session.location && <p className="truncate">📍 {session.location}</p>}
      </div>

      {/* Host */}
      <div className="flex items-center gap-2 text-sm">
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
          {session.host.name?.[0]?.toUpperCase()}
        </div>
        <span className="text-gray-600">{session.host.name}</span>
        <span className={`text-xs ${color}`}>⭐ {session.host.trustScore.toFixed(0)}</span>
      </div>

      {/* Capacity */}
      <div className="text-xs text-gray-400">
        {session._count.participants}/{session.maxCapacity} participants ·{" "}
        {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </p>
      )}

      {/* Action */}
      {!isPast && !isHost && session.status !== "CANCELLED" && (
        <button
          onClick={handleJoin}
          disabled={joining || joined || spotsLeft === 0}
          className={`w-full py-2 text-sm font-semibold rounded-lg transition-colors ${
            joined
              ? "bg-green-50 text-green-700 cursor-default"
              : spotsLeft === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          }`}
        >
          {joined ? "✓ Joined" : joining ? "Joining…" : "Join Session"}
        </button>
      )}
      {isHost && (
        <Link
          href={`/dashboard/sessions/${session.id}`}
          className="w-full py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-center"
        >
          Manage Session
        </Link>
      )}
    </article>
  );
}
