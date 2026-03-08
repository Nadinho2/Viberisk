"use client";

import React from "react";
import Link from "next/link";

type CalculatorInputs = {
  stake: string;
  riskPercent: string;
  leverage: string;
  entry: string;
  stop: string;
};

type CalculatorResult = {
  priceRiskPerUnit: number;
  riskAmount: number;
  positionSize: number;
  notionalValue: number;
  impliedLeverage: number;
  maxNotionalByLeverage: number;
  isCappedByLeverage: boolean;
};

function toNumber(value: string): number {
  if (!value) return 0;
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function computePosition(
  stakeStr: string,
  riskPercentStr: string,
  leverageStr: string,
  entryStr: string,
  stopStr: string
): CalculatorResult {
  const stake = toNumber(stakeStr);
  const riskPercent = toNumber(riskPercentStr);
  const leverage = Math.max(1, toNumber(leverageStr) || 1);
  const entry = toNumber(entryStr);
  const stop = toNumber(stopStr);

  const priceRiskPerUnit = Math.abs(entry - stop);
  const riskAmount = (stake * riskPercent) / 100;
  const maxNotionalByLeverage = stake * leverage;

  const riskBasedPositionSize =
    priceRiskPerUnit > 0 && riskAmount > 0 ? riskAmount / priceRiskPerUnit : 0;
  const riskBasedNotional = riskBasedPositionSize * entry;

  const isCappedByLeverage =
    riskBasedNotional > maxNotionalByLeverage && entry > 0;
  const positionSize = isCappedByLeverage
    ? maxNotionalByLeverage / entry
    : riskBasedPositionSize;
  const notionalValue = positionSize * entry;
  const impliedLeverage = stake > 0 ? notionalValue / stake : 0;

  return {
    priceRiskPerUnit,
    riskAmount,
    positionSize,
    notionalValue,
    impliedLeverage,
    maxNotionalByLeverage,
    isCappedByLeverage,
  };
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const PAIRS = [
  { slug: "", label: "Home", isHome: true },
  { slug: "btc-usdt", symbol: "BTC/USDT", label: "BTC" },
  { slug: "eth-usdt", symbol: "ETH/USDT", label: "ETH" },
  { slug: "sol-usdt", symbol: "SOL/USDT", label: "SOL" },
  { slug: "bnb-usdt", symbol: "BNB/USDT", label: "BNB" },
  { slug: "xaut-usdt", symbol: "XAUT/USDT", label: "XAUT" },
] as const;

type CalculatorProps = {
  symbol: string;
  defaultEntry: string;
  defaultStop: string;
};

export function Calculator({ symbol, defaultEntry, defaultStop }: CalculatorProps) {
  const [inputs, setInputs] = React.useState<CalculatorInputs>({
    stake: "1000",
    riskPercent: "1",
    leverage: "10",
    entry: defaultEntry,
    stop: defaultStop,
  });

  const handleChange =
    (field: keyof CalculatorInputs) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputs((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const {
    priceRiskPerUnit,
    riskAmount,
    positionSize,
    notionalValue,
    impliedLeverage,
    maxNotionalByLeverage,
    isCappedByLeverage,
  } = computePosition(
    inputs.stake,
    inputs.riskPercent,
    inputs.leverage,
    inputs.entry,
    inputs.stop
  );

  const stake = toNumber(inputs.stake);
  const riskPercent = toNumber(inputs.riskPercent);
  const leverage = toNumber(inputs.leverage) || 1;
  const entry = toNumber(inputs.entry);
  const stop = toNumber(inputs.stop);

  const hasAllValues =
    stake > 0 &&
    riskPercent > 0 &&
    leverage >= 1 &&
    entry > 0 &&
    stop > 0 &&
    entry !== stop;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 overflow-x-hidden">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-2 border-b border-slate-800 pb-5 sm:mb-8 sm:pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
              Crypto Position &amp; Risk Calculator
            </h1>
            <p className="mt-1 max-w-xl text-xs text-slate-400 sm:text-sm md:text-base">
              Size your crypto positions with professional‑grade risk controls.
              Enter your stake, risk %, entry and stop levels to get clean,
              instant sizing.
            </p>
          </div>
          <div className="mt-3 flex flex-col items-stretch gap-3 sm:mt-4 sm:items-end md:mt-0">
            <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0" aria-label="Navigation">
              {PAIRS.map(({ slug, label, isHome, symbol: pairSymbol }) => {
                const isActive =
                  isHome === true
                    ? false
                    : pairSymbol === symbol;
                return (
                  <Link
                    key={slug || "home"}
                    href={isHome ? "/" : `/${slug}`}
                    className={`min-h-[44px] min-w-[44px] shrink-0 rounded-lg px-3 py-2.5 text-xs font-medium transition flex items-center justify-center touch-manipulation sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
                      isActive
                        ? "bg-slate-700 text-slate-50"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 active:bg-slate-800"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="font-mono text-sm uppercase tracking-[0.25em] text-slate-400">
              {symbol}
            </div>
          </div>
        </header>

        {/* Main 2‑column content */}
        <main className="grid flex-1 gap-4 sm:gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Left: input panel */}
          <section className="min-w-0 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.85)] backdrop-blur sm:p-5">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-sm">
              Trade parameters
            </h2>
            <p className="mb-4 text-xs text-slate-400 sm:mb-6">
              All calculations are based on a simple long or short position with
              a fixed stop loss.
            </p>

            <div className="space-y-4 sm:space-y-5">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="stake"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
                  >
                    Stake (capital committed)
                  </label>
                  <input
                    id="stake"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={inputs.stake}
                    onChange={handleChange("stake")}
                    className="w-full min-h-[48px] rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30 touch-manipulation sm:min-h-[44px] sm:py-2 sm:text-sm"
                    placeholder="e.g. 1000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="riskPercent"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
                  >
                    Max loss (% of stake)
                  </label>
                  <input
                    id="riskPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    inputMode="decimal"
                    value={inputs.riskPercent}
                    onChange={handleChange("riskPercent")}
                    className="w-full min-h-[48px] rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30 touch-manipulation sm:min-h-[44px] sm:py-2 sm:text-sm"
                    placeholder="e.g. 1"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                  <label
                    htmlFor="leverage"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
                  >
                    Leverage
                  </label>
                  <input
                    id="leverage"
                    type="number"
                    min="1"
                    step="0.5"
                    inputMode="decimal"
                    value={inputs.leverage}
                    onChange={handleChange("leverage")}
                    className="w-full min-h-[48px] rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30 touch-manipulation sm:min-h-[44px] sm:py-2 sm:text-sm"
                    placeholder="e.g. 10"
                  />
                  <p className="text-[0.65rem] text-slate-500">
                    1 = spot. Max notional = stake × leverage.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="entry"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
                  >
                    Entry price
                  </label>
                  <input
                    id="entry"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={inputs.entry}
                    onChange={handleChange("entry")}
                    className="w-full min-h-[48px] rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30 touch-manipulation sm:min-h-[44px] sm:py-2 sm:text-sm"
                    placeholder="e.g. 60000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="stop"
                    className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
                  >
                    Stop loss price
                  </label>
                  <input
                    id="stop"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={inputs.stop}
                    onChange={handleChange("stop")}
                    className="w-full min-h-[48px] rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30 touch-manipulation sm:min-h-[44px] sm:py-2 sm:text-sm"
                    placeholder="e.g. 59000"
                  />
                </div>
              </div>

              {!hasAllValues && (
                <p className="text-xs text-amber-400/90">
                  Enter all values and ensure entry and stop are different to get
                  a valid position size.
                </p>
              )}
              {hasAllValues && stop > entry && (
                <p className="text-xs text-sky-400/90">
                  With stop above entry this configuration behaves like a{" "}
                  <span className="font-semibold">short</span> position. Numbers
                  remain valid; interpret direction accordingly.
                </p>
              )}
            </div>
          </section>

          {/* Right: results card */}
          <section className="min-w-0 rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.95)] backdrop-blur sm:p-5">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-sm">
              Position sizing summary
            </h2>
            <p className="mb-4 text-xs text-slate-400 sm:mb-6">
              Live risk metrics based on your current parameters.
            </p>

            <div className="space-y-4">
              <ResultRow
                label="Position size"
                value={
                  hasAllValues && positionSize > 0
                    ? `${numberFormatter.format(positionSize)} units`
                    : "—"
                }
              />
              <ResultRow
                label="Notional value"
                value={
                  hasAllValues && notionalValue > 0
                    ? `$${numberFormatter.format(notionalValue)}`
                    : "—"
                }
              />
              <ResultRow
                label="Max loss"
                value={
                  hasAllValues && riskAmount > 0
                    ? `-$${numberFormatter.format(riskAmount)} (${numberFormatter.format(
                        riskPercent
                      )}% of stake)`
                    : "—"
                }
                valueClassName="text-rose-300"
              />
              <ResultRow
                label="Price risk / unit"
                value={
                  hasAllValues && priceRiskPerUnit > 0
                    ? `$${numberFormatter.format(priceRiskPerUnit)}`
                    : "—"
                }
              />
              <ResultRow
                label="Leverage used"
                value={
                  hasAllValues && impliedLeverage > 0
                    ? `${numberFormatter.format(impliedLeverage)}x`
                    : "—"
                }
                valueClassName="text-emerald-300"
              />
              <ResultRow
                label="Max notional (stake × leverage)"
                value={
                  hasAllValues && maxNotionalByLeverage > 0
                    ? `$${numberFormatter.format(maxNotionalByLeverage)}`
                    : "—"
                }
              />
            </div>

            {hasAllValues && isCappedByLeverage && (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                Position capped by leverage. Risk-based size would exceed max
                notional; reduce risk % or increase leverage to size up.
              </p>
            )}

            <p className="mt-6 text-[0.7rem] leading-relaxed text-slate-500">
              The calculator sizes your position so that a move from entry to stop
              corresponds to your chosen percentage loss of the stake. It is a
              risk‑management tool, not investment advice.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

type ResultRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function ResultRow({ label, value, valueClassName }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <div className="min-w-0 shrink-0 text-[0.7rem] uppercase tracking-[0.12em] text-slate-500 sm:tracking-[0.16em]">
        {label}
      </div>
      <div
        className={`min-w-0 shrink text-right text-sm font-medium text-slate-100 break-words sm:text-base ${
          valueClassName ?? ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
