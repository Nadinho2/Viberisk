"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
  MouseEvent,
} from "react";

type Direction = "Long" | "Short";

type TakeProfitLevel = {
  price: number;
  percent: number;
};

export type PrefilledJournalData = {
  pair: string;
  direction: Direction;
  entry: number;
  size: number;
  lev: number;
  sl: number;
  liq: number;
  takeProfits: TakeProfitLevel[];
  accountRiskPercent?: number;
};

type MarketContext = {
  regime: string;
  sentiment: string;
  catalyst: string;
  higherTimeframe: string;
};

type TechnicalSetup = {
  strategy: string;
  confluence: string[];
  entryRationale: string;
  invalidation: string;
};

type RiskPlan = {
  accountRiskPercent: number | null;
  rationale: string;
  trailingPlan: string;
};

type RuleItem = {
  id: string;
  label: string;
  passed: boolean;
};

type Psychology = {
  confidence: number;
  mindset: string;
  rules: RuleItem[];
};

type ProofExtras = {
  screenshotUrl: string;
  tags: string[];
  notes: string;
};

export type RichJournalPayload = {
  pair: string;
  direction: Direction;
  entry: number;
  size: number;
  lev: number;
  sl: number;
  liq: number;
  takeProfits: TakeProfitLevel[];
  accountRiskPercent?: number;
  marketContext: MarketContext;
  technicalSetup: TechnicalSetup;
  riskPlan: RiskPlan;
  psychology: Psychology;
  proofExtras: ProofExtras;
  confluenceScore: number;
};

export interface RichJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledData: PrefilledJournalData | null;
  onSave: (data: RichJournalPayload) => void | Promise<void>;
}

const DEFAULT_RULE_LABELS = [
  "Higher timeframe aligned",
  "Risk < 2% of account",
  "No major news gamble",
] as const;

function createDefaultRules(): RuleItem[] {
  return DEFAULT_RULE_LABELS.map((label, idx) => ({
    id: `base-${idx}`,
    label,
    passed: false,
  }));
}

const STRATEGY_OPTIONS = [
  "Breakout",
  "Pullback",
  "SMC Order Block",
  "Liquidity Grab",
  "Reversal",
  "Mean Reversion",
  "Momentum",
  "Custom",
] as const;

const CONFLUENCE_OPTIONS = [
  "MA alignment",
  "RSI divergence",
  "Volume spike",
  "Structure break",
  "Fair Value Gap",
  "Liquidity sweep",
  "HTF key level",
] as const;

const REGIME_OPTIONS = [
  "Trending up",
  "Trending down",
  "Ranging",
  "High volatility",
  "News-driven",
] as const;

const SENTIMENT_OPTIONS = ["Bullish", "Bearish", "Neutral"] as const;

const MINDSET_OPTIONS = [
  "Calm / Focused",
  "FOMO",
  "Revenge",
  "Overconfident",
  "Tired / Distracted",
] as const;

const glassPanel =
  "rounded-2xl border border-slate-800/80 bg-black/80 backdrop-blur shadow-[0_0_40px_rgba(0,243,255,0.3)]";

const neonInput =
  "w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#00f3ff] focus:ring-2 focus:ring-[#00f3ff]/40";

const neonLabel = "text-[0.7rem] font-medium text-slate-300";

function computeConfluenceScore(
  sectionsFilled: number,
  rules: RuleItem[]
): number {
  const base = 4;
  const rulesMet = rules.filter((r) => r.passed).length;
  const score = base + sectionsFilled + rulesMet;
  return Math.max(1, Math.min(10, score));
}

function sectionFilled(values: (string | number | null | undefined)[]): boolean {
  return values.some((v) => {
    if (typeof v === "number") return Number.isFinite(v);
    if (typeof v === "string") return v.trim().length > 0;
    return false;
  });
}

const RichJournalModal: React.FC<RichJournalModalProps> = ({
  isOpen,
  onClose,
  prefilledData,
  onSave,
}) => {
  // Section states
  const [marketRegime, setMarketRegime] = useState<string>(REGIME_OPTIONS[0]);
  const [sentiment, setSentiment] = useState<string>(SENTIMENT_OPTIONS[0]);
  const [catalyst, setCatalyst] = useState("");
  const [higherTF, setHigherTF] = useState("4h");

  const [strategy, setStrategy] = useState<string>(STRATEGY_OPTIONS[0]);
  const [customStrategy, setCustomStrategy] = useState("");
  const [confluence, setConfluence] = useState<string[]>([]);
  const [entryRationale, setEntryRationale] = useState("");
  const [invalidation, setInvalidation] = useState("");

  const [riskPercent, setRiskPercent] = useState<string>("1.0");
  const [riskRationale, setRiskRationale] = useState("");
  const [trailingPlan, setTrailingPlan] = useState("");

  const [confidence, setConfidence] = useState(7);
  const [mindset, setMindset] = useState<string>(MINDSET_OPTIONS[0]);
  const [rules, setRules] = useState<RuleItem[]>(createDefaultRules());
  const [newRuleLabel, setNewRuleLabel] = useState("");

  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen || !prefilledData) return;
    setHigherTF("4h");
    setRiskPercent(
      String(
        prefilledData.accountRiskPercent != null
          ? prefilledData.accountRiskPercent
          : "1.0"
      )
    );
    setMarketRegime(REGIME_OPTIONS[0]);
    setSentiment(SENTIMENT_OPTIONS[0]);
    setStrategy(STRATEGY_OPTIONS[0]);
    setCustomStrategy("");
    setConfluence([]);
    setEntryRationale("");
    setInvalidation("");
    setRiskRationale("");
    setTrailingPlan("");
    setConfidence(7);
    setMindset(MINDSET_OPTIONS[0]);
    setRules(createDefaultRules());
    setNewRuleLabel("");
    setScreenshotUrl("");
    setTags("");
    setNotes("");
  }, [isOpen, prefilledData]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent | KeyboardEventInit) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey as any);
    return () => window.removeEventListener("keydown", handleKey as any);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const toggleConfluence = (item: string) => {
    setConfluence((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const toggleRule = (id: string, passed: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, passed } : r))
    );
  };

  const addCustomRule = () => {
    const label = newRuleLabel.trim();
    if (!label) return;
    setRules((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, label, passed: false },
    ]);
    setNewRuleLabel("");
  };

  const sectionsFilledCount = useMemo(() => {
    let count = 0;
    if (
      sectionFilled([
        marketRegime,
        sentiment,
        catalyst,
        higherTF,
      ])
    )
      count += 1;
    if (sectionFilled([strategy, customStrategy, entryRationale, invalidation]))
      count += 1;
    if (sectionFilled([riskPercent, riskRationale, trailingPlan])) count += 1;
    if (sectionFilled([mindset, confidence])) count += 1;
    if (sectionFilled([screenshotUrl, tags, notes])) count += 1;
    return count;
  }, [
    marketRegime,
    sentiment,
    catalyst,
    higherTF,
    strategy,
    customStrategy,
    entryRationale,
    invalidation,
    riskPercent,
    riskRationale,
    trailingPlan,
    mindset,
    confidence,
    screenshotUrl,
    tags,
    notes,
  ]);

  const confluenceScore = useMemo(
    () => computeConfluenceScore(sectionsFilledCount, rules),
    [sectionsFilledCount, rules]
  );

  const canSave = !!prefilledData && confluenceScore >= 5;

  const handleSave = async () => {
    if (!prefilledData || !canSave) return;
    const marketContext: MarketContext = {
      regime: marketRegime,
      sentiment,
      catalyst,
      higherTimeframe: higherTF,
    };
    const technicalSetup: TechnicalSetup = {
      strategy: strategy === "Custom" ? customStrategy || "Custom" : strategy,
      confluence,
      entryRationale,
      invalidation,
    };
    const riskPlan: RiskPlan = {
      accountRiskPercent:
        prefilledData.accountRiskPercent ??
        (Number(riskPercent) || null),
      rationale: riskRationale,
      trailingPlan,
    };
    const psychology: Psychology = {
      confidence,
      mindset,
      rules,
    };
    const proofExtras: ProofExtras = {
      screenshotUrl,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes,
    };

    const payload: RichJournalPayload = {
      pair: prefilledData.pair,
      direction: prefilledData.direction,
      entry: prefilledData.entry,
      size: prefilledData.size,
      lev: prefilledData.lev,
      sl: prefilledData.sl,
      liq: prefilledData.liq,
      takeProfits: prefilledData.takeProfits,
      accountRiskPercent: riskPlan.accountRiskPercent || undefined,
      marketContext,
      technicalSetup,
      riskPlan,
      psychology,
      proofExtras,
      confluenceScore,
    };

    await onSave(payload);
    onClose();
  };

  if (!isOpen || !prefilledData) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`${glassPanel} max-h-[90vh] w-full max-w-4xl transform overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 transition-all duration-300 scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#00f3ff] sm:text-xl">
              VibeJournal – Trade Blueprint
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Free, high-context journaling for this setup. Saved alongside your
              trades.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-xs text-slate-300 hover:border-[#ff00aa] hover:text-[#ff00aa]"
          >
            Esc
          </button>
        </header>

        <div className="space-y-3 text-xs sm:text-[0.8rem]">
          {/* Section 1 */}
          <details open className="rounded-xl border border-slate-800/80 bg-slate-950/60">
            <summary className="cursor-pointer select-none px-3 py-2 text-[#00f3ff]">
              1 · Trade identity
            </summary>
            <div className="grid gap-3 px-3 pb-3 pt-1 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[0.7rem] text-slate-400">Pair</p>
                <p className="mt-1 font-semibold text-slate-50">
                  {prefilledData.pair}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[0.7rem] text-slate-400">Direction</p>
                <p className="mt-1 font-semibold text-[#ff00aa]">
                  {prefilledData.direction}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[0.7rem] text-slate-400">Account risk %</p>
                <p className="mt-1 font-semibold text-slate-50">
                  {prefilledData.accountRiskPercent ?? riskPercent}%
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[0.7rem] text-slate-400">Entry</p>
                <p className="mt-1 font-mono text-slate-50">
                  {prefilledData.entry}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[0.7rem] text-slate-400">Size</p>
                <p className="mt-1 font-mono text-slate-50">
                  {prefilledData.size}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[0.7rem] text-slate-400">Lev / Liq</p>
                <p className="mt-1 font-mono text-slate-50">
                  {prefilledData.lev}x · Liq {prefilledData.liq}
                </p>
              </div>
            </div>
          </details>

          {/* Section 2 */}
          <details className="rounded-xl border border-slate-800/80 bg-slate-950/60">
            <summary className="cursor-pointer select-none px-3 py-2 text-[#00f3ff]">
              2 · Market context
            </summary>
            <div className="grid gap-3 px-3 pb-3 pt-1 sm:grid-cols-2">
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>Market regime</label>
                  <select
                    value={marketRegime}
                    onChange={(e) => setMarketRegime(e.target.value)}
                    className={neonInput}
                  >
                    {REGIME_OPTIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={neonLabel}>Overall sentiment</label>
                  <select
                    value={sentiment}
                    onChange={(e) => setSentiment(e.target.value)}
                    className={neonInput}
                  >
                    {SENTIMENT_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>Higher timeframe</label>
                  <input
                    value={higherTF}
                    onChange={(e) => setHigherTF(e.target.value)}
                    className={neonInput}
                    placeholder="e.g. 4h, Daily"
                  />
                </div>
                <div>
                  <label className={neonLabel}>
                    Key catalyst / news / event
                  </label>
                  <input
                    value={catalyst}
                    onChange={(e) => setCatalyst(e.target.value)}
                    className={neonInput}
                    placeholder="ETF flows, FOMC, funding reset..."
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Section 3 */}
          <details className="rounded-xl border border-slate-800/80 bg-slate-950/60">
            <summary className="cursor-pointer select-none px-3 py-2 text-[#00f3ff]">
              3 · Technical setup
            </summary>
            <div className="grid gap-3 px-3 pb-3 pt-1 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>Strategy</label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className={neonInput}
                  >
                    {STRATEGY_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {strategy === "Custom" && (
                    <input
                      value={customStrategy}
                      onChange={(e) => setCustomStrategy(e.target.value)}
                      className={`${neonInput} mt-2`}
                      placeholder="Describe your custom play."
                    />
                  )}
                </div>
                <div>
                  <label className={neonLabel}>Confluence factors</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {CONFLUENCE_OPTIONS.map((c) => {
                      const active = confluence.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleConfluence(c)}
                          className={`rounded-full px-2.5 py-1 text-[0.65rem] ${
                            active
                              ? "border border-[#ff00aa] bg-[#ff00aa]/10 text-[#ff00aa]"
                              : "border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>
                    Exact entry trigger / rationale
                  </label>
                  <textarea
                    value={entryRationale}
                    onChange={(e) => setEntryRationale(e.target.value)}
                    className={`${neonInput} min-h-[70px]`}
                    placeholder="What has to happen on the chart before you click?"
                  />
                </div>
                <div>
                  <label className={neonLabel}>
                    Chart pattern / invalidation reason
                  </label>
                  <textarea
                    value={invalidation}
                    onChange={(e) => setInvalidation(e.target.value)}
                    className={`${neonInput} min-h-[60px]`}
                    placeholder="Why will this stop loss hold? What kills the idea?"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Section 4 */}
          <details className="rounded-xl border border-slate-800/80 bg-slate-950/60">
            <summary className="cursor-pointer select-none px-3 py-2 text-[#00f3ff]">
              4 · Risk &amp; reward plan
            </summary>
            <div className="grid gap-3 px-3 pb-3 pt-1 sm:grid-cols-2">
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>Account risk %</label>
                  <input
                    type="number"
                    min={0.1}
                    max={2}
                    step={0.1}
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    className={neonInput}
                  />
                  <p className="mt-1 text-[0.65rem] text-slate-500">
                    1–2% recommended. Your calculator risk is{" "}
                    {prefilledData.accountRiskPercent ?? "n/a"}%.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-2">
                    <p className="text-slate-400">Entry</p>
                    <p className="mt-1 font-mono text-slate-50">
                      {prefilledData.entry}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-2">
                    <p className="text-slate-400">Stop</p>
                    <p className="mt-1 font-mono text-slate-50">
                      {prefilledData.sl}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>Risk rationale</label>
                  <textarea
                    value={riskRationale}
                    onChange={(e) => setRiskRationale(e.target.value)}
                    className={`${neonInput} min-h-[70px]`}
                    placeholder="Why is this risk size justified for this setup?"
                  />
                </div>
                <div>
                  <label className={neonLabel}>
                    Trailing stop / scaling plan
                  </label>
                  <textarea
                    value={trailingPlan}
                    onChange={(e) => setTrailingPlan(e.target.value)}
                    className={`${neonInput} min-h-[60px]`}
                    placeholder="How will you trail or take partials?"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Section 5 */}
          <details className="rounded-xl border border-slate-800/80 bg-slate-950/60">
            <summary className="cursor-pointer select-none px-3 py-2 text-[#00f3ff]">
              5 · Psychology &amp; discipline
            </summary>
            <div className="grid gap-3 px-3 pb-3 pt-1 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>
                    Pre-trade confidence (1–10)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={confidence}
                      onChange={(e) =>
                        setConfidence(Number(e.target.value))
                      }
                      className="flex-1 accent-[#00f3ff]"
                    />
                    <span className="w-6 text-right text-sm font-semibold text-[#00f3ff]">
                      {confidence}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={neonLabel}>Mindset</label>
                  <select
                    value={mindset}
                    onChange={(e) => setMindset(e.target.value)}
                    className={neonInput}
                  >
                    {MINDSET_OPTIONS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={neonLabel}>Add custom rule</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      value={newRuleLabel}
                      onChange={(e) => setNewRuleLabel(e.target.value)}
                      className={neonInput}
                      placeholder="e.g. Only 1 trade per session"
                    />
                    <button
                      type="button"
                      onClick={addCustomRule}
                      className="rounded-lg border border-[#00f3ff] bg-slate-950/80 px-3 py-2 text-[0.7rem] text-[#00f3ff] hover:bg-[#00f3ff]/10"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[0.7rem] font-medium text-slate-300">
                  Rule adherence checklist
                </p>
                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                  {rules.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1.5"
                    >
                      <span className="text-[0.7rem] text-slate-200">
                        {r.label}
                      </span>
                      <div className="flex gap-1 text-[0.65rem]">
                        <button
                          type="button"
                          onClick={() => toggleRule(r.id, true)}
                          className={`rounded-full px-2 py-0.5 ${
                            r.passed
                              ? "bg-[#00f3ff]/20 text-[#00f3ff]"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRule(r.id, false)}
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
                  ))}
                </div>
              </div>
            </div>
          </details>

          {/* Section 6 */}
          <details className="rounded-xl border border-slate-800/80 bg-slate-950/60">
            <summary className="cursor-pointer select-none px-3 py-2 text-[#00f3ff]">
              6 · Proof &amp; extras
            </summary>
            <div className="grid gap-3 px-3 pb-3 pt-1 sm:grid-cols-2">
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>Chart screenshot URL</label>
                  <input
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    className={neonInput}
                    placeholder="TradingView snapshot or image URL"
                  />
                </div>
                <div>
                  <label className={neonLabel}>Tags</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={neonInput}
                    placeholder='Comma-separated, e.g. "High conviction, News play"'
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className={neonLabel}>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`${neonInput} min-h-[80px]`}
                    placeholder="Any extra commentary for future you."
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
                  <div className="text-[0.7rem] text-slate-400">
                    Live confluence score
                  </div>
                  <div className="text-2xl font-bold text-[#00f3ff] drop-shadow-[0_0_15px_#00f3ff]">
                    {confluenceScore}
                    <span className="ml-1 text-xs text-slate-400">/10</span>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
          <p className="text-[0.7rem] text-slate-400">
            Save will attach this journal to the trade and keep a PDF-grade
            mental snapshot of the setup.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-red-500/70 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-300 shadow-[0_0_16px_rgba(248,113,113,0.5)] hover:bg-red-500/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-lg border border-emerald-400/80 bg-emerald-400/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200 shadow-[0_0_18px_rgba(34,197,94,0.7)] hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-400 disabled:shadow-none"
            >
              Save Trade &amp; Journal
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RichJournalModal;

