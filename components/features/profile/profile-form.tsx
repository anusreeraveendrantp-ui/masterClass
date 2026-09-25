"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { updateProfileSchema } from "@/lib/validators/profile";

interface ProfileFormProps {
  user: { id: string; name: string | null; email: string | null; image: string | null };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name ?? "");
  const [image, setImage] = useState(user.image ?? "");
  const [status, setStatus] = useState<{ ok?: boolean; msg?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({});

    const parsed = updateProfileSchema.safeParse({ name, image });
    if (!parsed.success) {
      setStatus({ ok: false, msg: parsed.error.issues[0].message });
      return;
    }

    setLoading(true);
    const result = await updateProfile({ name, image });
    setLoading(false);
    setStatus({ ok: result.success, msg: result.success ? result.message : result.error });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
    >
      <h2 className="font-semibold text-gray-900">Personal Information</h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email (read-only)
        </label>
        <input
          id="email"
          type="email"
          value={user.email ?? ""}
          disabled
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Avatar URL (optional)
        </label>
        <input
          id="image"
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {status.msg && (
        <p
          role={status.ok ? "status" : "alert"}
          className={`text-sm px-3 py-2 rounded-lg ${
            status.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {status.msg}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
