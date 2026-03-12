"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="neon-bg min-h-screen px-4 py-8 sm:px-5 sm:py-10 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            About VibeRisk
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Crypto position sizing, risk management, and trade journaling — built for traders who take risk seriously.
          </p>
        </header>

        <section className="neon-card-soft space-y-5 p-4 text-sm text-slate-200 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-[#39FF88]">
              What we do
            </h2>
            <p className="mt-2 text-slate-300">
              VibeRisk is a free web app that helps you size positions, set stop-loss and take-profit levels, and log your trades with clear risk metrics. Use the <strong className="text-slate-100">Risk Calculator</strong> to compute position size and R-multiples, then save outcomes to your personal <strong className="text-slate-100">Dashboard</strong>. The <strong className="text-slate-100">Trade Journal</strong> lets you record detailed setups, confluence, and psychology — and export entries as PDFs for your own archive.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#39FF88]">
              Who it&apos;s for
            </h2>
            <p className="mt-2 text-slate-300">
              Whether you trade spot or futures, VibeRisk is for anyone who wants to quantify risk per trade, avoid overleveraging, and keep a structured record of what worked and what didn&apos;t. No connection to your exchange or wallet is required: you enter your numbers, we help you stay disciplined.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#39FF88]">
              Our approach
            </h2>
            <p className="mt-2 text-slate-300">
              We believe in simple, transparent tools. No ads, no selling your data, no unnecessary complexity. The calculator is available to everyone; signing in lets you persist your trades and journal entries so you can review performance over time and improve your edge.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#39FF88]">
              Built by
            </h2>
            <p className="mt-2 text-slate-300">
              VibeRisk is built and maintained by{" "}
              <a
                href="https://x.com/NadinhoCrypto"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#39FF88] hover:underline"
              >
                @NadinhoCrypto
              </a>
              . If you have feedback, feature ideas, or just want to say hi, head over to the{" "}
              <Link href="/contact" className="font-medium text-[#39FF88] hover:underline">
                Contact
              </Link>{" "}
              page.
            </p>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/risk" className="neon-button-primary">
            Try Risk Calculator
          </Link>
          <Link href="/contact" className="neon-button-secondary">
            Get in touch
          </Link>
        </div>
      </div>
    </main>
  );
}
