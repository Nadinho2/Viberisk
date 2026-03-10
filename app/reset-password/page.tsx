"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const passwordHint =
  "At least 8 characters, with uppercase, lowercase and a number.";

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token || "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setStatus("Password reset successful. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setStatus(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-xl">
          <p className="mb-4 text-sm text-red-400">
            Reset token is missing or invalid.
          </p>
          <a
            href="/forgot-password"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
          >
            Request new reset link
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-semibold text-emerald-400">
          Choose a new password
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Your reset link is time-limited for security.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              New password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">{passwordHint}</p>
          </div>

          {status && (
            <p className="text-sm text-emerald-400" aria-live="polite">
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          <a href="/login" className="text-emerald-400 hover:underline">
            Back to login
          </a>
        </div>
      </div>
    </main>
  );
}

