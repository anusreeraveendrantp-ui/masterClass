"use client";

import { useState } from "react";
import { completeSession, cancelSession, rateParticipant } from "@/lib/actions/sessions";
import { AIGuidePanel } from "@/components/features/ai/ai-guide-panel";
import { getTrustLabel } from "@/lib/trust-score";

interface Participant {
  id: string;
  status: string;
  user: { id: string; name: string | null; image: string | null; trustScore: number };
}

interface SessionDetailProps {
  session: {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    location: string | null;
    status: string;
    maxCapacity: number;
    course: { id: string; name: string; code: string };
    host: { id: string; name: string | null; image: string | null; trustScore: number };
    participants: Participant[];
    ratings: { rateeId: string; score: number }[];
    studyGuide: { aiGeneratedContent: string | null; sourceNotes: string } | null;
  };
  currentUserId: string;
  isHost: boolean;
  isParticipant: boolean;
}

export function SessionDetail({ session, currentUserId, isHost, isParticipant }: SessionDetailProps) {
  const [status, setStatus] = useState(session.status);
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function handleComplete() {
    setLoading("complete");
    const r = await completeSession(session.id);
    setLoading(null);
    if (r.success) setStatus("COMPLETED");
    setMsg(r.success ? r.message : r.error);
  }

  async function handleCancel() {
    if (!confirm("Cancel this session? This cannot be undone.")) return;
    setLoading("cancel");
    const r = await cancelSession(session.id);
    setLoading(null);
    if (r.success) setStatus("CANCELLED");
    setMsg(r.success ? r.message : r.error);
  }

  async function handleRate(rateeId: string, score: number) {
    const r = await rateParticipant(session.id, rateeId, score);
    setMsg(r.success ? r.message : r.error);
  }

  const alreadyRated = new Set(session.ratings.map((r) => r.rateeId));

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {session.course.code}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{session.title}</h1>
            {session.description && (
              <p className="text-gray-500 mt-1">{session.description}</p>
            )}
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium shrink-0 ${
              status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : status === "COMPLETED"
                ? "bg-gray-100 text-gray-500"
                : status === "CANCELLED"
                ? "bg-red-100 text-red-600"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-500">
          <p>
            📅{" "}
            {new Date(session.startTime).toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            ⏰{" "}
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
          {session.location && <p>📍 {session.location}</p>}
          <p>
            👥 {session.participants.length}/{session.maxCapacity} participants
          </p>
        </div>

        {msg && (
          <p className="mt-3 text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg">
            {msg}
          </p>
        )}

        {/* Host actions */}
        {isHost && status === "UPCOMING" && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleComplete}
              disabled={loading === "complete"}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {loading === "complete" ? "…" : "Mark Completed"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading === "cancel"}
              className="px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 disabled:opacity-60 transition-colors"
            >
              {loading === "cancel" ? "…" : "Cancel Session"}
            </button>
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Participants</h2>
        <ul className="space-y-3">
          {session.participants.map(({ user, status: pStatus }) => {
            const { color } = getTrustLabel(user.trustScore);
            const canRate =
              status === "COMPLETED" &&
              user.id !== currentUserId &&
              !alreadyRated.has(user.id);
            return (
              <li key={user.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                    {user.id === session.host.id && (
                      <span className="ml-2 text-xs text-indigo-500">host</span>
                    )}
                  </p>
                  <p className={`text-xs ${color}`}>
                    ⭐ {user.trustScore.toFixed(0)} · {pStatus}
                  </p>
                </div>
                {canRate && <RateButton onRate={(score) => handleRate(user.id, score)} />}
                {alreadyRated.has(user.id) && user.id !== currentUserId && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Rated
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* AI Study Guide */}
      {(isParticipant || isHost) && (
        <AIGuidePanel
          sessionId={session.id}
          existingGuide={session.studyGuide?.aiGeneratedContent ?? null}
        />
      )}
    </div>
  );
}

function RateButton({ onRate }: { onRate: (score: number) => void }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <div className="flex gap-1" role="group" aria-label="Rate participant">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => {
            onRate(s);
            setOpen(false);
          }}
          className="text-yellow-400 hover:text-yellow-500 text-lg leading-none"
          aria-label={`Rate ${s} star${s !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="text-xs text-indigo-600 hover:underline"
    >
      Rate
    </button>
  );
}
