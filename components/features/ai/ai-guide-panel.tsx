"use client";

import { useState } from "react";
import { useCompletion } from "ai/react";

interface AIGuidePanelProps {
  sessionId: string;
  existingGuide: string | null;
}

export function AIGuidePanel({ sessionId, existingGuide }: AIGuidePanelProps) {
  const [notes, setNotes] = useState("");
  const [showExisting, setShowExisting] = useState(!!existingGuide);

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/study-guide",
    body: { sessionId, notes },
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim() || notes.length < 50) return;
    setShowExisting(false);
    await complete(notes);
  }

  const displayContent = completion || (showExisting ? existingGuide : null);

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 p-6"
      aria-labelledby="ai-guide-heading"
    >
      <div className="flex items-center gap-2 mb-4">
        <span aria-hidden="true" className="text-2xl">🤖</span>
        <h2 id="ai-guide-heading" className="font-semibold text-gray-900">
          AI Study Guide Generator
        </h2>
      </div>

      <form onSubmit={handleGenerate} className="space-y-3">
        <div>
          <label htmlFor="ai-notes" className="block text-sm font-medium text-gray-700 mb-1">
            Paste your notes (min 50 characters)
          </label>
          <textarea
            id="ai-notes"
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste lecture notes, textbook excerpts, or any topic you want to study…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          />
          <p className="text-xs text-gray-400 mt-1">{notes.length} / 50 min characters</p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || notes.length < 50}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isLoading ? "Generating…" : "Generate Study Guide"}
        </button>
      </form>

      {/* Output */}
      {displayContent && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {completion ? "Live Output" : "Saved Guide"}
            </h3>
            {isLoading && (
              <span className="text-xs text-indigo-500 animate-pulse">Streaming…</span>
            )}
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed">
            {displayContent}
          </div>
        </div>
      )}
    </section>
  );
}
