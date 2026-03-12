"use client";

import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });

      if (!res.ok) {
        throw new Error("Failed to send reset email");
      }

      setStatus("If that account exists, a reset link has been sent.");
    } catch {
      setStatus("Unable to send reset email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="neon-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md neon-card p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.8)]">
          Reset your password
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Enter your email or username and we&apos;ll send a reset link.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email or Username
            </label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#00f3ff] focus:ring-2 focus:ring-[#00f3ff]/40"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {status && (
            <p className="text-sm text-emerald-400" aria-live="polite">
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neon-button-primary w-full text-sm"
          >
            {loading ? "Sending..." : "Send reset link"}
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

