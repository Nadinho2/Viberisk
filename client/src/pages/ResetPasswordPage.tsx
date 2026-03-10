import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

const passwordHint =
  "At least 8 characters, including uppercase, lowercase and a number.";

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post("/auth/reset-password", { token, password });
      setStatus("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to reset password.";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card w-full max-w-md p-8 text-center">
          <p className="mb-4 text-sm text-red-400">
            Reset token is missing or invalid.
          </p>
          <Link to="/forgot-password" className="btn-primary">
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-emerald-400">
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
              className="input"
              type="password"
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

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
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

