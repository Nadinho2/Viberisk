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
  { slug: "btc", symbol: "BTC", label: "BTC" },
  { slug: "eth", symbol: "ETH", label: "ETH" },
  { slug: "sol", symbol: "SOL", label: "SOL" },
  { slug: "bnb", symbol: "BNB", label: "BNB" },
  { slug: "xaut", symbol: "XAUT", label: "XAUT" },
] as const;

type CalculatorProps = {
  symbol: string;
  defaultEntry: string;
  defaultStop: string;
};

export default function CryptoRiskCalculator({
  symbol,
  defaultEntry,
  defaultStop,
}: CalculatorProps) {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* VibeRisk Header */}
        <div className="mb-10 flex items-end justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-[#39FF88]">
              VibeRisk
            </h1>
            <p className="mt-2 text-zinc-400">
              Crypto Position • Risk • Betting Calculator
            </p>
          </div>
          <div className="font-mono text-sm uppercase tracking-widest text-[#39FF88]">
            {symbol}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mb-10 flex flex-wrap gap-3">
          {PAIRS.map((pair) => {
            const isHome = "isHome" in pair && pair.isHome;
            const pairSymbol = "symbol" in pair ? pair.symbol : "";
            const isActive = isHome ? false : pairSymbol === symbol;

            return (
              <Link
                key={pair.slug || "home"}
                href={isHome ? "/" : `/${pair.slug}`}
                className={`rounded-2xl px-6 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#39FF88] text-black shadow-[0_0_25px_#39FF88]"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {pair.label}
              </Link>
            );
          })}
        </nav>

        {/* Main Calculator */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Inputs Panel - Neon Version */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88]">
              TRADE PARAMETERS
            </h2>
            <p className="mb-6 text-xs text-zinc-400">
              Size your crypto position with professional risk controls. All
              calculations are live.
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                    Stake (capital committed)
                  </label>
                  <input
                    type="number"
                    value={inputs.stake}
                    onChange={handleChange("stake")}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-lg focus:border-[#39FF88] focus:outline-none"
                    placeholder="1000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                    Max loss (% of stake)
                  </label>
                  <input
                    type="number"
                    value={inputs.riskPercent}
                    onChange={handleChange("riskPercent")}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-lg focus:border-[#39FF88] focus:outline-none"
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                    Leverage
                  </label>
                  <input
                    type="number"
                    value={inputs.leverage}
                    onChange={handleChange("leverage")}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-lg focus:border-[#39FF88] focus:outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                    Entry price
                  </label>
                  <input
                    type="number"
                    value={inputs.entry}
                    onChange={handleChange("entry")}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-lg focus:border-[#39FF88] focus:outline-none"
                    placeholder="60000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                    Stop loss price
                  </label>
                  <input
                    type="number"
                    value={inputs.stop}
                    onChange={handleChange("stop")}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-lg focus:border-[#39FF88] focus:outline-none"
                    placeholder="59000"
                  />
                </div>
              </div>

              {!hasAllValues && (
                <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
                  Enter all values and make sure entry ≠ stop to see live
                  results.
                </p>
              )}
              {hasAllValues && stop > entry && (
                <p className="rounded-xl bg-sky-500/10 px-4 py-3 text-xs text-sky-400">
                  This setup is a SHORT position (stop above entry).
                </p>
              )}
            </div>
          </div>

          {/* Results Panel - Neon Version */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88]">
              POSITION SIZING SUMMARY
            </h2>
            <p className="mb-6 text-xs text-zinc-400">
              Live risk metrics • Updated instantly
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
                valueClassName="text-red-400"
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
                valueClassName="text-[#39FF88]"
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
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-400">
                ⚠️ Position capped by leverage. Reduce risk % or increase
                leverage to size up.
              </div>
            )}

            <p className="mt-10 text-[10px] text-zinc-500">
              Built in public by @NadinhoCrypto • VibeRisk • Trade & gamble
              responsibly
            </p>
          </div>
        </div>
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
    <div className="flex items-center justify-between border-b border-zinc-800 py-4 last:border-b-0">
      <div className="text-xs uppercase tracking-widest text-zinc-400">
        {label}
      </div>
      <div
        className={`font-mono text-lg font-medium ${valueClassName || "text-zinc-100"}`}
      >
        {value}
      </div>
    </div>
  );
}