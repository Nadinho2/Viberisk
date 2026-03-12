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
      <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-8 sm:px-5 sm:py-10 md:px-6 md:py-12 lg:px-8">
        {/* Hero / intro */}
        <header className="mb-10 border-b border-slate-800 pb-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)] md:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[0.7rem] text-slate-300 shadow-[0_0_20px_rgba(0,243,255,0.35)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00f3ff]" />
                100% free · No signup needed to try the calculator
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
                Size Crypto Trades Like a Pro
              </h1>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                VibeRisk combines a precision risk calculator, trade journal, and PnL
                dashboard so you can stop guessing and start operating like a desk.
              </p>
              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Instant position sizing, taken/missed tracking, and a rich trade
                journal – all wrapped in a neon, trader-first experience.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/risk"
                  className="inline-flex items-center justify-center rounded-lg bg-[#39FF88] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_24px_rgba(57,255,136,0.75)] hover:bg-[#2fd270]"
                >
                  Try the risk calculator
                </Link>
                {loading ? null : user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 hover:border-[#39FF88] hover:text-[#39FF88]"
                  >
                    View my dashboard
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 hover:border-[#39FF88] hover:text-[#39FF88]"
                  >
                    Get started (free)
                  </Link>
                )}
              </div>
            </div>

            {/* Hero media / placeholders for screenshots */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-700/90 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 shadow-[0_0_35px_rgba(0,243,255,0.4)]">
                <div
                  className="mb-2 h-32 overflow-hidden rounded-xl bg-slate-900/80 sm:h-36"
                  style={{
                    backgroundImage: "url(/risk-preview.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Calculator preview
                </p>
                <p className="mt-1 text-[0.7rem] text-slate-400">
                  Drop a screenshot of the Risk Calculator here later.
                </p>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-700/80 bg-slate-950/90 p-3 shadow-[0_0_28px_rgba(255,0,170,0.4)]">
                  <div
                    className="mb-2 h-20 overflow-hidden rounded-xl bg-slate-900/80"
                    style={{
                      backgroundImage: "url(/dashboard-preview.png)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Dashboard preview
                  </p>
                  <p className="mt-1 text-[0.7rem] text-slate-400">
                    Reserve for a screenshot of PnL + trade list.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700/80 bg-slate-950/90 p-3 shadow-[0_0_24px_rgba(0,243,255,0.25)]">
                  <div
                    className="mb-2 h-16 overflow-hidden rounded-xl bg-slate-900/80"
                    style={{
                      backgroundImage: "url(/journal-preview.png)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Journal preview
                  </p>
                  <p className="mt-1 text-[0.7rem] text-slate-400">
                    Space for a GIF of the Trade Journal modal or page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Live chart */}
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

        {/* Quick link to main calculator */}
        <section className="mt-10 border-t border-slate-800 pt-6 sm:mt-12 sm:pt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-sm">
            Position calculator
          </h2>
          <p className="mb-4 text-[0.7rem] text-slate-400 sm:text-xs">
            Use the main Risk Calculator to size any pair – you can switch
            symbols inside the tool and auto-fill live prices.
          </p>
          <Link
            href="/risk"
            className="neon-button-primary text-[0.7rem] sm:text-xs"
          >
            Open Risk Calculator
          </Link>
        </section>

        {/* How it works */}
        <section className="mt-10 border-t border-slate-800 pt-6 sm:mt-12 sm:pt-8 pb-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-sm">
            How VibeRisk fits your flow
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_18px_rgba(0,243,255,0.3)]">
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#00f3ff]">
                1. Size
              </p>
              <p className="text-xs text-slate-300">
                Use the{" "}
                <Link href="/risk" className="text-[#00f3ff] hover:underline">
                  Risk Calculator
                </Link>{" "}
                to turn account size + risk % into executable size, leverage and
                liquidation for any setup.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_18px_rgba(255,0,170,0.25)]">
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#ff00aa]">
                2. Log
              </p>
              <p className="text-xs text-slate-300">
                Mark setups as{" "}
                <span className="font-semibold text-slate-100">Taken</span> or{" "}
                <span className="font-semibold text-slate-100">Missed</span>, then
                use the Trade Journal to capture context, mindset and confluence in
                seconds.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_18px_rgba(57,255,136,0.3)]">
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#39FF88]">
                3. Review
              </p>
              <p className="text-xs text-slate-300">
                After trades play out, record outcomes and PnL – they roll up into
                your{" "}
                <Link
                  href="/dashboard"
                  className="text-[#39FF88] hover:underline"
                >
                  Dashboard
                </Link>{" "}
                so you can see total PnL and which setups really work.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}