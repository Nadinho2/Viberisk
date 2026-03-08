"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

const PAIRS = [
  { slug: "", label: "Home", isHome: true },
  { slug: "btc-usdt", label: "BTC" },
  { slug: "eth-usdt", label: "ETH" },
  { slug: "sol-usdt", label: "SOL" },
  { slug: "bnb-usdt", label: "BNB" },
  { slug: "xaut-usdt", label: "XAUT" },
] as const;

export function CryptoChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
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
      script.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 overflow-x-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-800 pb-5 sm:mb-8 sm:pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
              Crypto Live Chart
            </h1>
            <p className="mt-1 max-w-xl text-xs text-slate-400 sm:text-sm md:text-base">
              Real-time price movements across major pairs. Green for gains, red
              for declines. Switch symbols in the chart or use calculators below.
            </p>
          </div>
          <nav
            className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
            aria-label="Navigation"
          >
            {PAIRS.map(({ slug, label, isHome }) => (
              <Link
                key={slug || "home"}
                href={isHome ? "/" : `/${slug}`}
                className={`min-h-[44px] min-w-[44px] shrink-0 rounded-lg px-3 py-2.5 text-xs font-medium transition flex items-center justify-center touch-manipulation sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
                  isHome
                    ? "bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/40"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 active:bg-slate-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
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
            {PAIRS.filter((p) => !p.isHome).map(({ slug, label }) => (
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
      </div>
    </div>
  );
}
