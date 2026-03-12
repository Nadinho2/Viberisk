"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Direction = "long" | "short";
type Sentiment = "bullish" | "bearish" | "neutral";

const EXCHANGES = ["Binance", "Bybit", "OKX", "Bitget", "Other"] as const;
const REGIMES = [
  "Trending Up",
  "Trending Down",
  "Ranging",
  "High Volatility",
  "News-Driven"
] as const;

const STRATEGIES = [
  "Breakout",
  "Pullback",
  "SMC Order Block",
  "Liquidity Grab",
  "Reversal",
  "Mean Reversion",
  "Momentum",
  "Custom"
] as const;

const CONFLUENCE_OPTIONS = [
  "MA alignment",
  "RSI divergence",
  "Volume spike",
  "Structure break",
  "Fair Value Gap",
  "HTF level",
  "Liquidity sweep"
] as const;

const DEFAULT_RULES = [
  "Higher timeframe aligned",
  "Risk < 2% of account",
  "No major news event in next 30 minutes",
  "RR ≥ 2:1",
  "Setup matches written playbook"
];

async function downloadJournalPdf(
  payload: Record<string, unknown>,
  confluenceScore: number
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  const title = "VibeRisk Trade Journal";
  doc.setFontSize(16);
  doc.text(title, 10, 15);

  doc.setFontSize(10);
  const createdAt = new Date().toLocaleString();
  doc.text(`Created: ${createdAt}`, 10, 22);

  const lines: string[] = [];
  lines.push("SECTION 1 · Trade identity");
  lines.push(`Pair: ${payload.pair}`);
  lines.push(`Direction: ${payload.direction}`);
  lines.push(`Exchange: ${payload.exchange}`);
  lines.push(
    `TFs: ${payload.primaryTimeframe} (primary), ${payload.higherTimeframe} (HTF)`
  );
  lines.push("");
  lines.push("SECTION 2 · Market context");
  lines.push(`Regime: ${payload.marketRegime}`);
  lines.push(`HTF Bias: ${payload.htfBias}`);
  if (payload.sentiment) {
    lines.push(`Sentiment: ${payload.sentiment}`);
  }
  if (payload.catalyst) {
    lines.push(`Catalyst: ${payload.catalyst}`);
  }
  if (payload.drawdownContext) {
    lines.push(`Drawdown: ${payload.drawdownContext}`);
  }
  lines.push("");
  lines.push("SECTION 3 · Technical setup");
  lines.push(`Strategy: ${payload.strategyType}`);
  if (Array.isArray(payload.confluenceFactors)) {
    lines.push(
      `Confluence: ${(payload.confluenceFactors as string[]).join(", ")}`
    );
  }
  if (payload.entryRationale) {
    lines.push(`Entry rationale: ${payload.entryRationale}`);
  }
  if (payload.invalidationReason) {
    lines.push(`Invalidation: ${payload.invalidationReason}`);
  }
  if (Array.isArray(payload.keyLevels) && (payload.keyLevels as string[]).length) {
    lines.push(`Key levels: ${(payload.keyLevels as string[]).join(" | ")}`);
  }
  lines.push("");
  lines.push("SECTION 4 · Risk & reward");
  lines.push(`Account risk %: ${payload.accountRiskPercent}`);
  if (payload.positionSize) {
    lines.push(`Position size: ${payload.positionSize}`);
  }
  if (payload.impliedLeverage) {
    lines.push(`Implied leverage: ${payload.impliedLeverage}`);
  }
  if (payload.liquidationPrice) {
    lines.push(`Liquidation: ${payload.liquidationPrice}`);
  }
  lines.push(`Stop loss: ${payload.stopLossPrice}`);
  if (payload.stopLossRationale) {
    lines.push(`SL rationale: ${payload.stopLossRationale}`);
  }
  if (payload.riskRewardRatio) {
    lines.push(`Planned RR: ${payload.riskRewardRatio}`);
  }
  lines.push("");
  lines.push("SECTION 5 · Psychology");
  lines.push(`Confidence: ${payload.confidence}/10`);
  if (payload.mindset) {
    lines.push(`Mindset: ${payload.mindset}`);
  }
  if (payload.emotionalNotes) {
    lines.push(`Notes: ${payload.emotionalNotes}`);
  }
  lines.push("");
  lines.push("SECTION 6 · Extras");
  if (payload.chartUrl) {
    lines.push(`Chart: ${payload.chartUrl}`);
  }
  if (Array.isArray(payload.tags) && (payload.tags as string[]).length) {
    lines.push(`Tags: ${(payload.tags as string[]).join(", ")}`);
  }
  if (payload.preTradeNotes) {
    lines.push(`Pre-trade notes: ${payload.preTradeNotes}`);
  }
  lines.push("");
  lines.push(`Confluence score: ${confluenceScore}/10`);
  if (payload.missed) {
    lines.push("Marked as MISSED trade (documented but not taken).");
  }

  const split = doc.splitTextToSize(lines.join("\n"), 190);
  doc.text(split, 10, 30);

  const safePair = String(payload.pair || "pair")
    .replace(/[^\w\-]+/g, "_")
    .toLowerCase();
  doc.save(`viberisk-journal-${safePair}-${Date.now()}.pdf`);
}

export default function TradeJournalPage() {
  const router = useRouter();

  // Section 1
  const [pair, setPair] = useState("BTC/USDT");
  const [direction, setDirection] = useState<Direction>("long");
  const [exchange, setExchange] = useState<(typeof EXCHANGES)[number]>("Binance");
  const [primaryTf, setPrimaryTf] = useState("15m");
  const [higherTf, setHigherTf] = useState("4h");

  // Section 2
  const [regime, setRegime] = useState<(typeof REGIMES)[number]>("Trending Up");
  const [htfBias, setHtfBias] = useState("Bullish");
  const [catalyst, setCatalyst] = useState("");
  const [catalystDate, setCatalystDate] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>("bullish");
  const [drawdownContext, setDrawdownContext] = useState("");

  // Section 3
  const [strategy, setStrategy] = useState<(typeof STRATEGIES)[number]>(
    "Breakout"
  );
  const [customStrategy, setCustomStrategy] = useState("");
  const [confluence, setConfluence] = useState<string[]>([]);
  const [entryRationale, setEntryRationale] = useState("");
  const [invalidationReason, setInvalidationReason] = useState("");
  const [keyLevels, setKeyLevels] = useState<string>("");

  // Section 4
  const [accountRiskPercent, setAccountRiskPercent] = useState("1.0");
  const [positionSize, setPositionSize] = useState("");
  const [impliedLev, setImpliedLev] = useState("");
  const [liqPrice, setLiqPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [stopRationale, setStopRationale] = useState("");
  const [tp1Price, setTp1Price] = useState("");
  const [tp1Percent, setTp1Percent] = useState("50");
  const [tp2Price, setTp2Price] = useState("");
  const [tp2Percent, setTp2Percent] = useState("25");
  const [tp3Price, setTp3Price] = useState("");
  const [tp3Percent, setTp3Percent] = useState("25");
  const [rrOverride, setRrOverride] = useState("");
  const [trailingPlan, setTrailingPlan] = useState("");

  // Section 5
  const [confidence, setConfidence] = useState(7);
  const [mindset, setMindset] = useState(
    "Calm / Focused"
  );
  const [rulesState, setRulesState] = useState(
    DEFAULT_RULES.map((rule) => ({ rule, passed: false, notes: "" }))
  );
  const [emotionalNotes, setEmotionalNotes] = useState("");

  // Section 6
  const [chartUrl, setChartUrl] = useState("");
  const [tags, setTags] = useState("");
  const [preTradeNotes, setPreTradeNotes] = useState("");
  const [missed, setMissed] = useState(false);

  const confluenceScore = useMemo(() => {
    const base = confluence.length;
    const rulesPassed = rulesState.filter((r) => r.passed).length;
    const raw = base + rulesPassed;
    return Math.max(1, Math.min(10, raw));
  }, [confluence, rulesState]);

  const parsedKeyLevels = useMemo(
    () =>
      keyLevels
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [keyLevels]
  );

  const handleToggleConfluence = (item: string) => {
    setConfluence((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleRuleToggle = (idx: number, passed: boolean) => {
    setRulesState((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, passed } : r))
    );
  };

  const handleRuleNotesChange = (idx: number, value: string) => {
    setRulesState((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, notes: value } : r))
    );
  };

  const computedRr = useMemo(() => {
    if (rrOverride.trim() !== "") {
      const v = Number(rrOverride);
      return Number.isFinite(v) ? v : undefined;
    }
    // simple heuristic: more TPs and confluence => higher RR
    let rr = 1.5;
    rr += confluence.length * 0.2;
    if (tp3Price) rr += 0.5;
    else if (tp2Price) rr += 0.3;
    return Math.round(rr * 10) / 10;
  }, [rrOverride, confluence.length, tp2Price, tp3Price]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const tpLevels = [
      tp1Price && {
        price: Number(tp1Price),
        percent: Number(tp1Percent) || 0
      },
      tp2Price && {
        price: Number(tp2Price),
        percent: Number(tp2Percent) || 0
      },
      tp3Price && {
        price: Number(tp3Price),
        percent: Number(tp3Percent) || 0
      }
    ].filter(Boolean) as { price: number; percent: number }[];

    const payload = {
      pair: pair.trim(),
      direction,
      exchange,
      primaryTimeframe: primaryTf.trim(),
      higherTimeframe: higherTf.trim(),
      marketRegime: regime,
      htfBias: htfBias.trim(),
      catalyst: catalyst.trim() || undefined,
      catalystDate: catalystDate ? new Date(catalystDate) : undefined,
      sentiment,
      drawdownContext: drawdownContext.trim() || undefined,
      strategyType:
        strategy === "Custom" ? customStrategy.trim() || "Custom" : strategy,
      confluenceFactors: confluence,
      entryRationale: entryRationale.trim(),
      invalidationReason: invalidationReason.trim(),
      keyLevels: parsedKeyLevels,
      accountRiskPercent: Number(accountRiskPercent) || 0,
      positionSize: positionSize ? Number(positionSize) : undefined,
      impliedLeverage: impliedLev ? Number(impliedLev) : undefined,
      liquidationPrice: liqPrice ? Number(liqPrice) : undefined,
      stopLossPrice: Number(stopPrice) || 0,
      stopLossRationale: stopRationale.trim() || undefined,
      tpLevels,
      riskRewardRatio: computedRr,
      trailingPlan: trailingPlan.trim() || undefined,
      confidence,
      mindset,
      rulesChecklist: rulesState,
      emotionalNotes: emotionalNotes.trim() || undefined,
      chartUrl: chartUrl.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      preTradeNotes: preTradeNotes.trim() || undefined,
      confluenceScore,
      missed
    };

    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // eslint-disable-next-line no-alert
      alert("Failed to save journal entry.");
      return;
    }

    await downloadJournalPdf(payload, confluenceScore);

    // eslint-disable-next-line no-alert
    alert("Trade journal entry saved.");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-6 text-slate-50 sm:px-5 sm:py-8 md:px-6 md:py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl md:text-3xl">
            Trade Journal
          </h1>
          <p className="mt-2 max-w-2xl text-xs text-slate-400 sm:text-sm">
            Capture the full story of each setup: context, edge, risk plan, and
            your mindset before you click.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 pb-10"
          autoComplete="off"
        >
          {/* Section 1 */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88] sm:text-sm">
              Section 1 · Trade identity
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Pair / Asset
                </label>
                <input
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  placeholder="e.g. BTC/USDT"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) =>
                    setDirection(e.target.value as Direction)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Exchange
                </label>
                <select
                  value={exchange}
                  onChange={(e) =>
                    setExchange(e.target.value as (typeof EXCHANGES)[number])
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                >
                  {EXCHANGES.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Primary timeframe
                </label>
                <input
                  value={primaryTf}
                  onChange={(e) => setPrimaryTf(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  placeholder="e.g. 15m"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Higher timeframe
                </label>
                <input
                  value={higherTf}
                  onChange={(e) => setHigherTf(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  placeholder="e.g. 4h or Daily"
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88] sm:text-sm">
              Section 2 · Market context
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Market regime
                </label>
                <select
                  value={regime}
                  onChange={(e) =>
                    setRegime(e.target.value as (typeof REGIMES)[number])
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                >
                  {REGIMES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Higher timeframe bias
                </label>
                <input
                  value={htfBias}
                  onChange={(e) => setHtfBias(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  placeholder="e.g. Bullish above weekly demand"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Overall sentiment
                </label>
                <select
                  value={sentiment}
                  onChange={(e) =>
                    setSentiment(e.target.value as Sentiment)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                >
                  <option value="bullish">Bullish</option>
                  <option value="bearish">Bearish</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Key catalyst / news / event
                </label>
                <input
                  value={catalyst}
                  onChange={(e) => setCatalyst(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  placeholder="e.g. ETF inflow data, FOMC minutes..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Catalyst date / time
                </label>
                <input
                  type="datetime-local"
                  value={catalystDate}
                  onChange={(e) => setCatalystDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <label className="text-[0.7rem] font-medium text-slate-300">
                Drawdown / context notes
              </label>
              <textarea
                value={drawdownContext}
                onChange={(e) => setDrawdownContext(e.target.value)}
                className="min-h-[70px] w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                placeholder="Where are you in your equity curve? Any recent tilt / overtrading?"
              />
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88] sm:text-sm">
              Section 3 · Technical setup
            </h2>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Strategy / setup type
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) =>
                      setStrategy(e.target.value as (typeof STRATEGIES)[number])
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  >
                    {STRATEGIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {strategy === "Custom" && (
                    <input
                      value={customStrategy}
                      onChange={(e) => setCustomStrategy(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                      placeholder="Describe your custom setup"
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Confluence factors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CONFLUENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleConfluence(opt)}
                        className={`rounded-full border px-3 py-1 text-[0.7rem] ${
                          confluence.includes(opt)
                            ? "border-[#39FF88] bg-[#39FF88]/10 text-[#39FF88]"
                            : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Key levels (one per line)
                  </label>
                  <textarea
                    value={keyLevels}
                    onChange={(e) => setKeyLevels(e.target.value)}
                    className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="e.g. Weekly resistance 72k&#10;4h demand 68.5k&#10;Liquidity pool 70.2k"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Exact entry trigger / rationale
                  </label>
                  <textarea
                    value={entryRationale}
                    onChange={(e) => setEntryRationale(e.target.value)}
                    className="min-h-[110px] w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="What exactly needs to happen to get you in? Describe in detail."
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Chart pattern / invalidation reason
                  </label>
                  <textarea
                    value={invalidationReason}
                    onChange={(e) => setInvalidationReason(e.target.value)}
                    className="min-h-[90px] w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="Why should this stop loss hold? What cancels the idea?"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88] sm:text-sm">
              Section 4 · Risk &amp; reward plan
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Account risk %
                </label>
                <input
                  type="number"
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={accountRiskPercent}
                  onChange={(e) => setAccountRiskPercent(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  required
                />
                <p className="text-[0.65rem] text-slate-500">
                  Enforces 1–2% style risk discipline.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Position size
                </label>
                <input
                  type="number"
                  value={positionSize}
                  onChange={(e) => setPositionSize(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  placeholder="Base units or contracts"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Implied leverage
                </label>
                <input
                  type="number"
                  value={impliedLev}
                  onChange={(e) => setImpliedLev(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  placeholder="e.g. 5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-medium text-slate-300">
                  Est. liquidation price
                </label>
                <input
                  type="number"
                  value={liqPrice}
                  onChange={(e) => setLiqPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Stop loss (price)
                  </label>
                  <input
                    type="number"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Stop loss rationale
                  </label>
                  <textarea
                    value={stopRationale}
                    onChange={(e) => setStopRationale(e.target.value)}
                    className="min-h-[70px] w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="Why is this the right invalidation level?"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[0.7rem] font-medium text-slate-300">
                      TP1 price
                    </label>
                    <input
                      type="number"
                      value={tp1Price}
                      onChange={(e) => setTp1Price(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    />
                    <input
                      type="number"
                      value={tp1Percent}
                      onChange={(e) => setTp1Percent(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[0.7rem] text-slate-50 outline-none focus:border-[#39FF88] focus:ring-1 focus:ring-[#39FF88]/30"
                      placeholder="%"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.7rem] font-medium text-slate-300">
                      TP2 price
                    </label>
                    <input
                      type="number"
                      value={tp2Price}
                      onChange={(e) => setTp2Price(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    />
                    <input
                      type="number"
                      value={tp2Percent}
                      onChange={(e) => setTp2Percent(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[0.7rem] text-slate-50 outline-none focus:border-[#39FF88] focus:ring-1 focus:ring-[#39FF88]/30"
                      placeholder="%"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.7rem] font-medium text-slate-300">
                      TP3 price
                    </label>
                    <input
                      type="number"
                      value={tp3Price}
                      onChange={(e) => setTp3Price(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    />
                    <input
                      type="number"
                      value={tp3Percent}
                      onChange={(e) => setTp3Percent(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[0.7rem] text-slate-50 outline-none focus:border-[#39FF88] focus:ring-1 focus:ring-[#39FF88]/30"
                      placeholder="%"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[0.7rem] font-medium text-slate-300">
                      Risk:Reward ratio
                    </label>
                    <input
                      type="number"
                      value={rrOverride}
                      onChange={(e) => setRrOverride(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                      placeholder={`Auto: ~${computedRr?.toFixed(1) ?? "2.0"}`}
                    />
                    <p className="text-[0.65rem] text-slate-500">
                      Leave blank to use auto estimate.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.7rem] font-medium text-slate-300">
                      Trailing stop / scaling plan
                    </label>
                    <textarea
                      value={trailingPlan}
                      onChange={(e) => setTrailingPlan(e.target.value)}
                      className="min-h-[60px] w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                      placeholder="How will you trail stops or scale out?"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88] sm:text-sm">
              Section 5 · Psychology &amp; discipline
            </h2>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Pre-trade confidence (1–10)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-6 text-right text-sm font-semibold text-[#39FF88]">
                      {confidence}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Mindset
                  </label>
                  <select
                    value={mindset}
                    onChange={(e) => setMindset(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                  >
                    <option>Calm / Focused</option>
                    <option>FOMO</option>
                    <option>Revenge</option>
                    <option>Overconfident</option>
                    <option>Tired / Distracted</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Emotional notes
                  </label>
                  <textarea
                    value={emotionalNotes}
                    onChange={(e) => setEmotionalNotes(e.target.value)}
                    className="min-h-[70px] w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="Anything you need to be honest about before entering."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[0.7rem] font-medium text-slate-300">
                  Rule adherence checklist
                </p>
                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  {rulesState.map((r, idx) => (
                    <div
                      key={r.rule}
                      className="flex flex-col gap-1 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-[0.7rem] font-medium text-slate-200">
                          {r.rule}
                        </label>
                        <div className="flex items-center gap-2 text-[0.7rem]">
                          <button
                            type="button"
                            onClick={() => handleRuleToggle(idx, true)}
                            className={`rounded-full px-2 py-0.5 ${
                              r.passed
                                ? "bg-[#39FF88]/20 text-[#39FF88]"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRuleToggle(idx, false)}
                            className={`rounded-full px-2 py-0.5 ${
                              !r.passed
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-900 text-slate-500"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      <input
                        value={r.notes}
                        onChange={(e) =>
                          handleRuleNotesChange(idx, e.target.value)
                        }
                        placeholder="Notes (optional)"
                        className="w-full rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-[0.7rem] text-slate-100 outline-none focus:border-[#39FF88] focus:ring-1 focus:ring-[#39FF88]/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#39FF88] sm:text-sm">
              Section 6 · Proof &amp; extras
            </h2>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Chart screenshot URL
                  </label>
                  <input
                    value={chartUrl}
                    onChange={(e) => setChartUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="TradingView snapshot link or image URL"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Custom tags
                  </label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder='Comma-separated, e.g. "High Conviction, News Play"'
                  />
                </div>
                <div className="flex items-center gap-2 text-[0.8rem] text-slate-300">
                  <input
                    id="missed"
                    type="checkbox"
                    checked={missed}
                    onChange={(e) => setMissed(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#39FF88]"
                  />
                  <label htmlFor="missed">
                    This is a{" "}
                    <span className="font-semibold text-slate-100">
                      missed trade
                    </span>{" "}
                    (documented setup you did not take).
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-medium text-slate-300">
                    Pre-trade notes
                  </label>
                  <textarea
                    value={preTradeNotes}
                    onChange={(e) => setPreTradeNotes(e.target.value)}
                    className="min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#39FF88] focus:ring-2 focus:ring-[#39FF88]/30"
                    placeholder="Any additional context or plan in free form."
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                  <div className="text-[0.7rem] text-slate-400">
                    Confluence score
                    <span className="ml-1 font-semibold text-slate-100">
                      {confluenceScore}/10
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void downloadJournalPdf(payload, confluenceScore)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-[0.7rem] text-slate-200 hover:border-[#39FF88] hover:text-[#39FF88]"
                  >
                    Download plan as PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <div className="text-[0.7rem] text-slate-400">
                When you save, this journal entry is stored to your account and
                can be reviewed alongside your PnL.
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[#39FF88] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_20px_rgba(57,255,136,0.5)] hover:bg-[#2fd270]"
              >
                Save journal entry
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}

