import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-xl">
            <p className="text-sm text-slate-300">Loading reset form...</p>
          </div>
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}

