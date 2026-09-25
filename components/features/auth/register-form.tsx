"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { registerUser } from "@/lib/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const result = await registerUser(values);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess(result.message);
      setTimeout(() => router.push("/login"), 1500);
    }
  }

  const field = (
    id: keyof RegisterInput,
    label: string,
    type: string,
    placeholder: string,
    autoComplete: string
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={values[id]}
        onChange={(e) => setValues((v) => ({ ...v, [id]: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {field("name", "Full name", "text", "Jane Smith", "name")}
      {field("email", "Email address", "email", "you@university.edu", "email")}
      {field("password", "Password", "password", "••••••••", "new-password")}
      {field("confirmPassword", "Confirm password", "password", "••••••••", "new-password")}

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors text-sm"
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
