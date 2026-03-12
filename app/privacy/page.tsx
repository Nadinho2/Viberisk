"use client";

export default function PrivacyPage() {
  return (
    <main className="neon-bg min-h-screen px-4 py-8 sm:px-5 sm:py-10 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            Last updated: March 2026
          </p>
        </header>

        <section className="neon-card-soft p-4 sm:p-5 text-sm text-slate-200">
          <p className="mb-3">
            VibeRisk is a personal crypto risk calculator, trade journal, and
            PnL dashboard. This page explains what data we collect, how we use
            it, and the choices you have. The goal is simple: give you tools to
            trade more professionally without abusing your data.
          </p>

          <h2 className="mt-4 text-sm font-semibold text-slate-100">
            1. What we store
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            <li>
              <span className="font-semibold text-slate-100">Account data</span>{" "}
              – username, email address, and a <strong>hashed</strong> password.
              We never store plain-text passwords.
            </li>
            <li>
              <span className="font-semibold text-slate-100">
                Trade + journal data
              </span>{" "}
              – position sizing inputs, logged trades (taken / missed),
              outcomes, journal notes, and metadata you choose to save.
            </li>
            <li>
              <span className="font-semibold text-slate-100">
                Technical data
              </span>{" "}
              – basic server logs for errors and security (IP, user agent,
              timestamps). These are used only for debugging and abuse
              prevention.
            </li>
          </ul>

          <h2 className="mt-4 text-sm font-semibold text-slate-100">
            2. What we <span className="underline">don&apos;t</span> do
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            <li>No selling of your data.</li>
            <li>No advertising trackers or third‑party analytics pixels.</li>
            <li>
              No read access to your exchange accounts, wallets, or API keys –
              VibeRisk works entirely off numbers you type in.
            </li>
          </ul>

          <h2 className="mt-4 text-sm font-semibold text-slate-100">
            3. Cookies &amp; authentication
          </h2>
          <p className="mt-2 text-slate-300">
            VibeRisk uses secure, httpOnly cookies to keep you signed in. These
            cookies are only used to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            <li>Verify your session when you open protected pages.</li>
            <li>Associate trades and journal entries with your account.</li>
          </ul>
          <p className="mt-2 text-slate-300">
            You can clear cookies or log out at any time to invalidate the
            session.
          </p>

          <h2 className="mt-4 text-sm font-semibold text-slate-100">
            4. Email
          </h2>
          <p className="mt-2 text-slate-300">
            Your email is used for:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            <li>Account creation and login.</li>
            <li>Password reset links when you request them.</li>
          </ul>
          <p className="mt-2 text-slate-300">
            You won&apos;t receive marketing blasts from this tool. If that ever
            changes, this policy will be updated and you&apos;ll have a clear
            opt‑out.
          </p>

          <h2 className="mt-4 text-sm font-semibold text-slate-100">
            5. Data retention &amp; deletion
          </h2>
          <p className="mt-2 text-slate-300">
            Trade and journal data is kept so that you can review your history
            and performance over time. If you want your account and data
            removed, you can contact the builder on X (
            <a
              href="https://x.com/NadinhoCrypto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#39FF88] hover:underline"
            >
              @NadinhoCrypto
            </a>
            ) and request deletion.
          </p>

          <h2 className="mt-4 text-sm font-semibold text-slate-100">
            6. Security
          </h2>
          <p className="mt-2 text-slate-300">
            Passwords are hashed using industry‑standard algorithms, and
            database access is restricted to the backend. No system is perfect,
            but the intent is to keep the attack surface as small and boring as
            possible.
          </p>

          <h2 className="mt-4 text-sm font-semibold text-slate-100">
            7. Changes to this policy
          </h2>
          <p className="mt-2 text-slate-300">
            This policy may evolve as VibeRisk grows. When it does, the{" "}
            <span className="font-semibold text-slate-100">Last updated</span>{" "}
            date at the top of this page will change. Significant changes will
            also be highlighted in the UI.
          </p>

          <h2 className="mt-4 text-sm font-semibold text-slate-100">
            8. Contact
          </h2>
          <p className="mt-2 text-slate-300">
            Questions or concerns? Reach out on X (
            <a
              href="https://x.com/NadinhoCrypto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#39FF88] hover:underline"
            >
              @NadinhoCrypto
            </a>
            ) and mention VibeRisk privacy.
          </p>
        </section>
      </div>
    </main>
  );
}

