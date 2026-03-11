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
  const [savingToDashboard, setSavingToDashboard] = useState(false);

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

  const handleAddToLog = async () => {
    if (!canCompute || riskPerTrade <= 0 || plannedR <= 0) {
      setToast({
        id: Date.now(),
        message: "Fill all required fields before logging a trade.",
        type: "error",
      });
      return;
    }

    const now = new Date();

    const entryPriceNum = toNumber(inputs.entry);
    const stopLossNum = toNumber(inputs.stop);
    const tp1 = toNumber(inputs.takeProfit1);
    const tp2 = toNumber(inputs.takeProfit2);
    const tp3 = toNumber(inputs.takeProfit3);

    const takeProfits = [
      ...(tp1 > 0 ? [{ price: tp1, percent: 0 }] : []),
      ...(tp2 > 0 ? [{ price: tp2, percent: 0 }] : []),
      ...(tp3 > 0 ? [{ price: tp3, percent: 0 }] : []),
    ];

    // MISSED trades: save to dashboard with category "missed", plus local journal
    if (status === "missed") {
      try {
        await fetch("/api/trades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            entryPrice: entryPriceNum,
            positionSize: orderQty,
            leverage: impliedLeverage || 1,
            liquidationPrice,
            stopLoss: stopLossNum,
            pnl: 0,
            status: "open",
            category: "missed",
            takeProfits,
          }),
        });

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
          status: "missed",
        };
        setLog((prev) => [entry, ...prev]);

        setInputs((prev) => ({
          ...prev,
          entry: "",
          stop: "",
          takeProfit1: "",
          takeProfit2: "",
          takeProfit3: "",
        }));

        setToast({
          id: now.getTime(),
          message: "Missed trade saved to your dashboard.",
          type: "success",
        });
      } catch {
        setToast({
          id: now.getTime(),
          message: "Unable to save missed trade to dashboard.",
          type: "error",
        });
      }
      return;
    }

    // TAKEN trades: send to dashboard with category "active"
    setSavingToDashboard(true);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          entryPrice: entryPriceNum,
          positionSize: orderQty,
          leverage: impliedLeverage || 1,
          liquidationPrice,
          stopLoss: stopLossNum,
          pnl: 0,
          status: "open",
          category: "active",
          takeProfits,
        }),
      });

      if (!res.ok) {
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
          message: "Dashboard save failed. Trade kept in local journal.",
          type: "error",
        });
        return;
      }

      setInputs((prev) => ({
        ...prev,
        entry: "",
        stop: "",
        takeProfit1: "",
        takeProfit2: "",
        takeProfit3: "",
      }));

      setToast({
        id: now.getTime(),
        message: "Trade saved to your dashboard.",
        type: "success",
      });
    } catch {
      setToast({
        id: now.getTime(),
        message: "Unable to save trade to dashboard. Try again later.",
        type: "error",
      });
    } finally {
      setSavingToDashboard(false);
    }
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
      rows
        .map((r) =>
          r.map((v) => `"${v.replace?.(/"/g, '""') ?? v}"`).join(",")
        )
        .join("\n");

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
      void handleAddToLog();
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50"
      onKeyDown={handleKeyDown}
    >
      <div className="mx-auto flex min-h-full max-w-6xl flex-col px-4 py-6 sm:px-5 sm:py-8 md:px-6 md:py-10 lg:px-8">
        {/* Header */}
        {/* ... unchanged header and calculator UI ... */}

        {/* At the bottom: trade log table; add delete button per row */}
        {/* Inside tbody map: */}
        {/* ...existing cells... */}
        {/* Replace the last <td> with this: */}
        {/* (or add this delete button into that <td>) */}

        {/* Example snippet for the delete button inside the row: */}
        {/* 
        <td className="px-3 py-2 align-top">
          {entry.status === "taken" && entry.realizedR != null
            ? usdFormatter.format(entry.riskAmount * entry.realizedR)
            : "—"}
          <button
            type="button"
            onClick={() =>
              setLog((prev) => prev.filter((e) => e.id !== entry.id))
            }
            className="ml-2 rounded border border-red-500/60 px-2 py-1 text-[0.7rem] text-red-400 hover:bg-red-500/10"
          >
            Delete
          </button>
        </td>
        */}
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