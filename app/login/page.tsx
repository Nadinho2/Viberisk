"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to login");
      }
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="neon-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md neon-card p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.8)]">
          VibeRisk Login
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Sign in to view your risk dashboard.
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

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 pr-10 text-sm text-slate-100 outline-none focus:border-[#00f3ff] focus:ring-2 focus:ring-[#00f3ff]/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[11px] text-slate-400 hover:text-emerald-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neon-button-primary w-full text-sm"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <a href="/forgot-password" className="text-emerald-400 hover:underline">
            Forgot password?
          </a>
          <span>
            New here?{" "}
            <a href="/register" className="text-emerald-400 hover:underline">
              Create account
            </a>
          </span>
        </div>
      </div>
    </main>
  );
}

