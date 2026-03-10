import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(identifier, password);
    if (useAuthStore.getState().user) {
      navigate(from, { replace: true });
    }
  };

  if (user) {
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-emerald-400">
          VibeRisk
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Login to access your crypto risk dashboard.
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

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" aria-live="polite">
              {error}
            </p>
          )}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <Link to="/forgot-password" className="text-emerald-400 hover:underline">
            Forgot password?
          </Link>
          <span>
            New here?{" "}
            <Link to="/register" className="text-emerald-400 hover:underline">
              Create account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

