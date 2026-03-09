 "use client";

import React, {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

type Direction = "long" | "short";
type AccountType = "personal" | "prop";

type RiskInputs = {
  accountSize: string;
  accountType: AccountType;
  symbol: string;
  riskPercent: string;
  direction: Direction;
  entry: string;
  stop: string;
  takeProfit1: string;
  takeProfit2: string;
  takeProfit3: string;
  maxLeverage: string;
};

type TradeLogStatus = "taken" | "missed";
type TradeOutcome = "open" | "win" | "loss" | "breakeven";

type TradeLogEntry = {
  id: number;
  timestamp: string;
  symbol: string;
  accountType: string;
  direction: Direction;
  riskPercent: number;
  plannedR: number;
  riskAmount: number;
  realizedR: number | null;
  outcome: TradeOutcome;
  status: TradeLogStatus;
};

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const qtyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
});

const ratioFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const LOCAL_STORAGE_KEY = "viberisk:risk-log:v1";

function toNumber(value: string): number {
  if (!value) return 0;
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function baseFromSymbol(symbol: string): string {
  const trimmed = symbol.trim();
  if (!trimmed) return "BTC";
  const base = trimmed.split(/[\/-]/)[0] ?? "";
  return base.toUpperCase() || "BTC";
}

function guessCoingeckoId(symbol: string): string {
  const base = baseFromSymbol(symbol).toUpperCase();
  switch (base) {
    case "BTC":
      return "bitcoin";
    case "ETH":
      return "ethereum";
    case "SOL":
      return "solana";
    case "BNB":
      return "binancecoin";
    case "XAUT":
      return "tether-gold";
    default:
      return base.toLowerCase();
  }
}

export default function RiskCalculatorPage() {
  const [inputs, setInputs] = useState<RiskInputs>({
    accountSize: "100000",
    accountType: "prop",
    symbol: "BTC/USDT",
    riskPercent: "0.25",
    direction: "long",
    entry: "92000",
    stop: "90000",
    takeProfit1: "96000",
    takeProfit2: "",
    takeProfit3: "",
    maxLeverage: "10",
  });

  const [status, setStatus] = useState<TradeLogStatus>("taken");
  const [log, setLog] = useState<TradeLogEntry[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  const handleChange =
    (field: keyof RiskInputs) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setInputs((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // Load log from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as TradeLogEntry[];
      if (Array.isArray(parsed)) {
        setLog(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist log to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(log));
    } catch {
      // ignore
    }
  }, [log]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const {
    accountSize,
    riskPercent,
    baseSymbol,
    riskPerTrade,
    orderQty,
    orderValue,
    priceRiskPerUnit,
    rewardAmount,
    plannedR,
    impliedLeverage,
    liquidationPrice,
    warningMessage,
    canCompute,
  } = useMemo(() => {
    const accountSizeNum = toNumber(inputs.accountSize);
    const riskPercentNum = toNumber(inputs.riskPercent);
    const entryNum = toNumber(inputs.entry);
    const stopNum = toNumber(inputs.stop);
    const tp1 = toNumber(inputs.takeProfit1);
    const tp2 = toNumber(inputs.takeProfit2);
    const tp3 = toNumber(inputs.takeProfit3);
    const maxLevNum = toNumber(inputs.maxLeverage);
    const direction: Direction = inputs.direction;

    const base = baseFromSymbol(inputs.symbol);

    const riskPerTradeNum =
      accountSizeNum > 0 && riskPercentNum > 0
        ? (accountSizeNum * riskPercentNum) / 100
        : 0;

    const distanceRisk = Math.abs(entryNum - stopNum);
    const orderQtyNum =
      riskPerTradeNum > 0 && distanceRisk > 0
        ? riskPerTradeNum / distanceRisk
        : 0;
    const orderValueNum =
      orderQtyNum > 0 && entryNum > 0 ? orderQtyNum * entryNum : 0;

    const tps: number[] = [];
    if (tp1 > 0) tps.push(tp1);
    if (tp2 > 0) tps.push(tp2);
    if (tp3 > 0) tps.push(tp3);

    const rewardDistances: number[] = tps
      .map((tp) => {
        if (direction === "long") {
          return tp > entryNum ? tp - entryNum : 0;
        }
        return tp < entryNum ? entryNum - tp : 0;
      })
      .filter((d) => d > 0);

    const rewardPerUnitWeighted =
      rewardDistances.length > 0
        ? rewardDistances.reduce((sum, d) => sum + d, 0) /
          rewardDistances.length
        : 0;

    const rewardAmountNum =
      rewardPerUnitWeighted > 0 && orderQtyNum > 0
        ? rewardPerUnitWeighted * orderQtyNum
        : 0;

    const plannedRNum =
      riskPerTradeNum > 0 && rewardAmountNum > 0
        ? rewardAmountNum / riskPerTradeNum
        : 0;

    const impliedLevNum =
      accountSizeNum > 0 && orderValueNum > 0
        ? orderValueNum / accountSizeNum
        : 0;

    const effectiveLev =
      impliedLevNum > 0 && maxLevNum > 0
        ? Math.min(impliedLevNum, maxLevNum)
        : impliedLevNum || maxLevNum || 1;

    let liquidation = 0;
    if (entryNum > 0 && effectiveLev > 0) {
      const move = entryNum / effectiveLev;
      liquidation =
        direction === "long" ? entryNum - move : entryNum + move;
    }

    const warning =
      impliedLevNum > 8
        ? "High leverage detected. Consider reducing size or widening your stop."
        : "";

    const canComputeNow =
      accountSizeNum > 0 &&
      riskPercentNum > 0 &&
      entryNum > 0 &&
      stopNum > 0 &&
      distanceRisk > 0;

    return {
      accountSize: accountSizeNum,
      riskPercent: riskPercentNum,
      baseSymbol: base,
      riskPerTrade: riskPerTradeNum,
      orderQty: orderQtyNum,
      orderValue: orderValueNum,
      priceRiskPerUnit: distanceRisk,
      rewardAmount: rewardAmountNum,
      plannedR: plannedRNum,
      impliedLeverage: impliedLevNum,
      liquidationPrice: liquidation,
      warningMessage: warning,
      canCompute: canComputeNow,
    };
  }, [inputs]);

  const handleAddToLog = () => {
    if (!canCompute || riskPerTrade <= 0 || plannedR <= 0) {
      setToast({
        id: Date.now(),
        message: "Fill all required fields before logging a trade.",
        type: "error",
      });
      return;
    }

    const now = new Date();
    const entry: TradeLogEntry = {
      id: now.getTime(),
      timestamp: now.toLocaleString(),
      symbol: inputs.symbol.trim() || "BTC/USDT",
      accountType: inputs.accountType === "prop" ? "Prop" : "Personal",
      direction: inputs.direction,
      riskPercent,
      plannedR,
      riskAmount: riskPerTrade,
      realizedR: null,
      outcome: "open",
      status,
    };

    setLog((prev) => [entry, ...prev]);
    setToast({
      id: now.getTime(),
      message: "Trade logged",
      type: "success",
    });
  };

  const handleUpdateLogEntry = (
    id: number,
    patch: Partial<Pick<TradeLogEntry, "status" | "realizedR" | "outcome">>
  ) => {
    setLog((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        let next: TradeLogEntry = { ...entry, ...patch };

        if (
          Object.prototype.hasOwnProperty.call(patch, "realizedR") &&
          patch.realizedR !== null &&
          patch.realizedR !== undefined &&
          !Object.prototype.hasOwnProperty.call(patch, "outcome")
        ) {
          if (patch.realizedR > 0) next.outcome = "win";
          else if (patch.realizedR < 0) next.outcome = "loss";
          else next.outcome = "breakeven";
        }

        return next;
      })
    );
  };

  const takenCount = log.filter((e) => e.status === "taken").length;
  const missedCount = log.filter((e) => e.status === "missed").length;

  const totalRealizedR = log.reduce((sum, entry) => {
    if (entry.status !== "taken" || entry.realizedR == null) return sum;
    return sum + entry.realizedR;
  }, 0);

  const totalRealizedPnl = log.reduce((sum, entry) => {
    if (entry.status !== "taken" || entry.realizedR == null) return sum;
    return sum + entry.riskAmount * entry.realizedR;
  }, 0);

  const takenWithOutcome = log.filter(
    (e) => e.status === "taken" && e.realizedR != null
  );
  const winCount = takenWithOutcome.filter(
    (e) => e.realizedR !== null && e.realizedR > 0
  ).length;
  const winRate =
    takenWithOutcome.length > 0
      ? (winCount / takenWithOutcome.length) * 100
      : 0;
  const avgR =
    takenWithOutcome.length > 0
      ? totalRealizedR / takenWithOutcome.length
      : 0;

  const handleExportCsv = () => {
    if (log.length === 0) {
      setToast({
        id: Date.now(),
        message: "No trades to export.",
        type: "error",
      });
      return;
    }

    const headers = [
      "Time",
      "Symbol",
      "AccountType",
      "Direction",
      "RiskPercent",
      "PlannedR",
      "RiskAmount",
      "RealizedR",
      "Outcome",
      "Status",
      "PnL",
    ];

    const rows = log.map((e) => {
      const pnl =
        e.status === "taken" && e.realizedR != null
          ? e.riskAmount * e.realizedR
          : 0;
      return [
        e.timestamp,
        e.symbol,
        e.accountType,
        e.direction,
        e.riskPercent.toString(),
        e.plannedR.toString(),
        e.riskAmount.toString(),
        e.realizedR == null ? "" : e.realizedR.toString(),
        e.outcome,
        e.status,
        pnl.toString(),
      ];
    });

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((v) => `"${v.replace?.(/"/g, '""') ?? v}"`).join(",")).join(
        "\n"
      );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "viberisk-trade-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFillCurrentPrice = async () => {
    const id = guessCoingeckoId(inputs.symbol);
    if (!id) {
      setToast({
        id: Date.now(),
        message: "Unable to determine asset for this symbol.",
        type: "error",
      });
      return;
    }

    try {
      setIsPriceLoading(true);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
          id
        )}&vs_currencies=usd`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch price");
      }
      const data = (await res.json()) as Record<string, { usd?: number }>;
      const price = data[id]?.usd;
      if (!price || !Number.isFinite(price)) {
        throw new Error("No USD price available");
      }
      setInputs((prev) => ({ ...prev, entry: price.toString() }));
      setToast({
        id: Date.now(),
        message: "Price updated from CoinGecko.",
        type: "success",
      });
    } catch {
      setToast({
        id: Date.now(),
        message: "Failed to fetch price. Try again later.",
        type: "error",
      });
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddToLog();
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50"
      onKeyDown={handleKeyDown}
    >
      <div className="mx-auto flex min-h-full max-w-6xl flex-col px-4 py-6 sm:px-5 sm:py-8 md:px-6 md:py-10 lg:px-8">
        {/* Header */}
        <header className="mb-6 border-b border-slate-800 pb-5 sm:mb-8 sm:pb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl md:text-3xl">
            Risk Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-xs text-slate-400 sm:text-sm md:text-base">
            Get precise position sizing from your account size and risk
            percentage. See exact order quantity, notional value, and
            risk‑reward, then log trades to track your performance.
          </p>
        </header>

        <main className="grid flex-1 gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Inputs */}
          <section className="min-w-0 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.85)] backdrop-blur sm:p-6">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88] sm:text-sm">
              Trade setup
            </h2>
            <p className="mb-4 text-xs text-slate-400 sm:mb-6">
              Start with your account, exact risk %, and levels. The calculator
              returns an executable position size you can type directly into the
              exchange.
            </p>

            <div className="space-y-6">
              {/* Account row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Account size (USDT)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs.accountSize}
                    onChange={handleChange("accountSize")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="e.g. 100000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Account type
                  </label>
                  <select
                    value={inputs.accountType}
                    onChange={handleChange("accountType")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  >
                    <option value="personal">Personal</option>
                    <option value="prop">Prop firm</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Risk per trade (%)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={inputs.riskPercent}
                    onChange={handleChange("riskPercent")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="e.g. 0.25"
                  />
                </div>
              </div>

              {/* Symbol + direction */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Pair / symbol
                  </label>
                  <input
                    type="text"
                    value={inputs.symbol}
                    onChange={handleChange("symbol")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="e.g. BTC/USDT"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Direction
                  </label>
                  <select
                    value={inputs.direction}
                    onChange={handleChange("direction")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
              </div>

              {/* Entry / stop / max leverage */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Entry price
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs.entry}
                    onChange={handleChange("entry")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="e.g. 92000"
                  />
                  <button
                    type="button"
                    onClick={handleFillCurrentPrice}
                    disabled={isPriceLoading}
                    className="mt-2 rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.7rem] font-medium text-slate-200 transition hover:border-[#39FF88] hover:text-[#39FF88] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPriceLoading ? "Fetching price…" : "Fill current price"}
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Stop loss price
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs.stop}
                    onChange={handleChange("stop")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="e.g. 90000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Max leverage allowed
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step="0.5"
                    value={inputs.maxLeverage}
                    onChange={handleChange("maxLeverage")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="e.g. 10"
                  />
                  <p className="mt-1 text-[0.65rem] text-slate-500">
                    Optional cap used for liquidation estimate.
                  </p>
                </div>
              </div>

              {/* TPs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Take profit 1
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs.takeProfit1}
                    onChange={handleChange("takeProfit1")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="e.g. 96000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Take profit 2
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs.takeProfit2}
                    onChange={handleChange("takeProfit2")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="optional"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Take profit 3
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs.takeProfit3}
                    onChange={handleChange("takeProfit3")}
                    className="w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="optional"
                  />
                </div>
              </div>

              {!canCompute && (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-[0.7rem] text-amber-300">
                  Fill in account size, risk %, entry, stop and at least one
                  take profit. Entry and stop must be different.
                </p>
              )}
            </div>
          </section>

          {/* Calculations */}
          <section className="min-w-0 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.95)] backdrop-blur sm:p-5">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88] sm:text-sm">
                Position recommendation
              </h2>
              <p className="mb-4 text-[0.7rem] text-slate-400 sm:text-xs">
                These numbers can be typed directly into your exchange ticket
                for this setup.
              </p>

              <div className="space-y-3">
                <OutputRow
                  label="Risk per trade"
                  value={
                    canCompute && riskPerTrade > 0
                      ? `${usdFormatter.format(riskPerTrade)} (${ratioFormatter.format(
                          riskPercent
                        )}% of account)`
                      : "—"
                  }
                />
                <OutputRow
                  label={`Order quantity (${baseSymbol})`}
                  value={
                    canCompute && orderQty > 0
                      ? `${qtyFormatter.format(orderQty)} ${baseSymbol}`
                      : "—"
                  }
                />
                <OutputRow
                  label="Notional value (USDT)"
                  value={
                    canCompute && orderValue > 0
                      ? usdFormatter.format(orderValue)
                      : "—"
                  }
                />
                <OutputRow
                  label="Price risk / unit"
                  value={
                    canCompute && priceRiskPerUnit > 0
                      ? usdFormatter.format(priceRiskPerUnit)
                      : "—"
                  }
                />
                <OutputRow
                  label="Potential reward (weighted)"
                  value={
                    canCompute && rewardAmount > 0
                      ? usdFormatter.format(rewardAmount)
                      : "—"
                  }
                />
                <OutputRow
                  label="Planned R:R"
                  value={
                    canCompute && plannedR > 0
                      ? `${ratioFormatter.format(plannedR)} R`
                      : "—"
                  }
                />
                <OutputRow
                  label="Implied leverage"
                  value={
                    canCompute && impliedLeverage > 0
                      ? `${ratioFormatter.format(impliedLeverage)}×`
                      : "—"
                  }
                />
                <OutputRow
                  label="Est. liquidation price"
                  value={
                    canCompute && liquidationPrice > 0
                      ? usdFormatter.format(liquidationPrice)
                      : "—"
                  }
                />
              </div>

              {warningMessage && (
                <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[0.7rem] text-amber-200">
                  {warningMessage}
                </div>
              )}
            </div>

            {/* Trade log */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.95)] backdrop-blur sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-sm">
                    Trade log
                  </h2>
                  <p className="mt-1 text-[0.7rem] text-slate-500">
                    Track risk / reward, outcomes, and PnL for every setup.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[0.7rem] text-slate-400">
                  <span>
                    Taken:{" "}
                    <span className="font-semibold text-slate-100">
                      {takenCount}
                    </span>
                  </span>
                  <span>
                    Missed:{" "}
                    <span className="font-semibold text-slate-100">
                      {missedCount}
                    </span>
                  </span>
                  <span className="hidden sm:inline">
                    Win rate:{" "}
                    <span className="font-semibold text-slate-100">
                      {ratioFormatter.format(winRate)}%
                    </span>
                  </span>
                  <span className="hidden sm:inline">
                    Avg R:{" "}
                    <span className="font-semibold text-slate-100">
                      {ratioFormatter.format(avgR)}
                    </span>
                  </span>
                  <span className="hidden sm:inline">
                    Total PnL:{" "}
                    <span
                      className={`font-semibold ${
                        totalRealizedPnl >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {totalRealizedPnl === 0
                        ? "0"
                        : usdFormatter.format(totalRealizedPnl)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-3">
                <label className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as TradeLogStatus)
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-50 outline-none transition focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                >
                  <option value="taken">Taken</option>
                  <option value="missed">Missed</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddToLog}
                  disabled={!canCompute || riskPerTrade <= 0}
                  className="rounded-lg bg-[#39FF88] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black shadow-[0_0_18px_rgba(57,255,136,0.6)] transition enabled:hover:bg-[#2fd270] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                >
                  Log trade (Ctrl/Cmd + Enter)
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-[#39FF88] hover:text-[#39FF88]"
                >
                  Export CSV
                </button>
              </div>

              {log.length === 0 ? (
                <p className="mt-2 text-[0.7rem] text-slate-500">
                  No trades logged yet. Once you size a setup, choose{" "}
                  <span className="font-semibold text-slate-300">
                    Taken
                  </span>{" "}
                  or{" "}
                  <span className="font-semibold text-slate-300">
                    Missed
                  </span>{" "}
                  and add it here.
                </p>
              ) : (
                <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-slate-800">
                  <table className="min-w-full text-left text-[0.7rem] text-slate-300">
                    <thead className="bg-slate-900/80 text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Pair</th>
                        <th className="px-3 py-2">Acct</th>
                        <th className="px-3 py-2">Dir</th>
                        <th className="px-3 py-2">Risk %</th>
                        <th className="px-3 py-2">Planned R:R</th>
                        <th className="px-3 py-2">Realized R</th>
                        <th className="px-3 py-2">Outcome</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">PnL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {log.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-t border-slate-800/80 odd:bg-slate-900/40"
                        >
                          <td className="px-3 py-2 align-top text-slate-400">
                            {entry.timestamp}
                          </td>
                          <td className="px-3 py-2 align-top font-mono text-slate-50">
                            {entry.symbol}
                          </td>
                          <td className="px-3 py-2 align-top text-slate-300">
                            {entry.accountType}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {entry.direction === "long" ? "Long" : "Short"}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {ratioFormatter.format(entry.riskPercent)}%
                          </td>
                          <td className="px-3 py-2 align-top">
                            {ratioFormatter.format(entry.plannedR)} R
                          </td>
                          <td className="px-3 py-2 align-top">
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              value={
                                entry.realizedR != null
                                  ? entry.realizedR
                                  : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                const parsed =
                                  value === "" ? null : toNumber(value);
                                handleUpdateLogEntry(entry.id, {
                                  realizedR: parsed,
                                });
                              }}
                              className="w-20 rounded border border-slate-700 bg-slate-950/70 px-2 py-1 text-[0.7rem] text-slate-50 outline-none focus:border-[#39FF88] focus:ring-1 focus:ring-[#39FF88]/40"
                              placeholder="e.g. 1.5"
                            />
                          </td>
                          <td className="px-3 py-2 align-top">
                            <select
                              value={entry.outcome}
                              onChange={(e) =>
                                handleUpdateLogEntry(entry.id, {
                                  outcome: e.target.value as TradeOutcome,
                                })
                              }
                              className="rounded border border-slate-700 bg-slate-950/80 px-2 py-1 text-[0.7rem] text-slate-50 outline-none focus:border-[#39FF88] focus:ring-1 focus:ring-[#39FF88]/40"
                            >
                              <option value="open">Open</option>
                              <option value="win">Win</option>
                              <option value="loss">Loss</option>
                              <option value="breakeven">Breakeven</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <select
                              value={entry.status}
                              onChange={(e) =>
                                handleUpdateLogEntry(entry.id, {
                                  status: e.target.value as TradeLogStatus,
                                })
                              }
                              className="rounded border border-slate-700 bg-slate-950/80 px-2 py-1 text-[0.7rem] text-slate-50 outline-none focus:border-[#39FF88] focus:ring-1 focus:ring-[#39FF88]/40"
                            >
                              <option value="taken">Taken</option>
                              <option value="missed">Missed</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 align-top">
                            {entry.status === "taken" &&
                            entry.realizedR != null
                              ? usdFormatter.format(
                                  entry.riskAmount * entry.realizedR
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[60] flex max-w-xs items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-xs text-slate-100 shadow-xl">
          <div
            className={`h-2 w-2 rounded-full ${
              toast.type === "success" ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  );
}

type OutputRowProps = {
  label: string;
  value: string;
};

function OutputRow({ label, value }: OutputRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 py-2 last:border-b-0 last:pb-0 first:pt-0">
      <div className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-500 sm:text-[0.68rem]">
        {label}
      </div>
      <div className="min-w-0 shrink text-right text-sm font-medium text-slate-100">
        {value}
      </div>
    </div>
  );
}

