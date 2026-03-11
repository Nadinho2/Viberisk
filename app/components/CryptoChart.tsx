"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const PAIRS = [
  { slug: "btc-usdt", label: "BTC" },
  { slug: "eth", label: "ETH" },
  { slug: "sol", label: "SOL" },
  { slug: "bnb", label: "BNB" },
  { slug: "xaut", label: "XAUT" },
] as const;

export function CryptoChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "BINANCE:BTCUSDT",
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      backgroundColor: "rgba(15, 23, 42, 1)",
      gridColor: "rgba(51, 65, 85, 0.4)",
      allow_symbol_change: true,
      support_host: "https://www.tradingview.com",
      calendar: false,
      studies: [],
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current?.contains(script)) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-6 sm:px-5 sm:py-8 md:px-6 md:py-10 lg:px-8">
        {/* Hero / intro */}
        <header className="mb-6 border-b border-slate-800 pb-5 sm:mb-8 sm:pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl md:text-4xl">
                Crypto Position &amp; Risk Dashboard
              </h1>
              <p className="mt-2 max-w-xl text-xs text-slate-400 sm:text-sm md:text-base">
                Size positions with precision, log trades as taken or missed, and track PnL and performance in your private VibeRisk dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {loading ? null : user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-lg bg-[#39FF88] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_18px_rgba(57,255,136,0.5)] hover:bg-[#2fd270]"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-lg bg-[#39FF88] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_18px_rgba(57,255,136,0.5)] hover:bg-[#2fd270]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 hover:border-[#39FF88] hover:text-[#39FF88]"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Chart */}
        <main className="flex-1 min-w-0">
          <div
            className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-2xl ring-1 ring-slate-700/50"
            style={{ height: "clamp(300px, 55vh, 700px)" }}
          >
            <div
              ref={containerRef}
              className="tradingview-widget-container flex h-full w-full flex-col"
              style={{ height: "100%" }}
            >
              <div
                className="tradingview-widget-container__widget flex-1"
                style={{ minHeight: 280 }}
              />
            </div>
          </div>

          <p className="mt-4 text-center text-[0.7rem] text-slate-500">
            Chart by{" "}
            <a
              href="https://www.tradingview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-300"
            >
              TradingView
            </a>
          </p>
        </main>

        {/* Quick links to calculators */}
        <section className="mt-8 border-t border-slate-800 pt-6 sm:mt-10 sm:pt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-sm">
            Position calculators
          </h2>
          <div className="flex flex-wrap gap-2">
            {PAIRS.map(({ slug, label }) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className="min-h-[48px] rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-700/50 hover:text-slate-100 active:bg-slate-700/50 touch-manipulation flex items-center sm:min-h-0 sm:py-2"
              >
                {label}/USDT calculator →
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-8 border-t border-slate-800 pt-6 sm:mt-10 sm:pt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-sm">
            How VibeRisk works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#39FF88]">
                1. Size the trade
              </p>
              <p className="text-xs text-slate-300">
                Use the <Link href="/risk" className="text-[#39FF88] hover:underline">Risk Calculator</Link> to get precise size, notional, and liquidation for each setup.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#39FF88]">
                2. Log taken / missed
              </p>
              <p className="text-xs text-slate-300">
                Log each setup as <span className="font-semibold">Taken</span> or <span className="font-semibold">Missed</span> with planned R directly from the risk page.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#39FF88]">
                3. Review your edge
              </p>
              <p className="text-xs text-slate-300">
                After the trade plays out, save the outcome and PnL – it syncs to your <Link href="/dashboard" className="text-[#39FF88] hover:underline">Dashboard</Link> with total PnL on top.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}