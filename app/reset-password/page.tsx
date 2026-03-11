import ResetPasswordForm from "./reset-password-form";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token || "";

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

  return <ResetPasswordForm token={token} />;
}

