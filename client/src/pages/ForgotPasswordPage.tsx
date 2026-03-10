import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post("/auth/forgot-password", { identifier });
      setStatus("If that account exists, a reset link has been sent.");
    } catch {
      setStatus("Unable to send reset email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-emerald-400">
          Reset your password
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Enter your email or username and we&apos;ll send you a reset link.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email or Username
            </label>
            <input
              className="input"
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

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          <Link to="/login" className="text-emerald-400 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

