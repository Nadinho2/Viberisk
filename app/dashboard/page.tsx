"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Trade = {
  _id: string;
  entryPrice: number;
  positionSize: number;
  leverage: number;
  liquidationPrice: number;
  stopLoss: number;
  pnl: number;
  status: "open" | "closed";
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [userLoaded, setUserLoaded] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    entryPrice: "",
    positionSize: "",
    leverage: "",
    liquidationPrice: "",
    stopLoss: "",
    pnl: ""
  });

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        router.replace("/login?redirect=/dashboard");
        return;
      }
      setUserLoaded(true);
    };
    void checkAuth();
  }, [router]);

  const loadTrades = async () => {
    if (!userLoaded) return;
    setLoadingTrades(true);
    try {
      const res = await fetch("/api/trades", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTrades(data.trades || []);
      }
    } finally {
      setLoadingTrades(false);
    }
  };

  useEffect(() => {
    void loadTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          entryPrice: Number(form.entryPrice),
          positionSize: Number(form.positionSize),
          leverage: Number(form.leverage),
          liquidationPrice: Number(form.liquidationPrice),
          stopLoss: Number(form.stopLoss),
          pnl: form.pnl ? Number(form.pnl) : 0,
          status: "open",
          takeProfits: []
        })
      });
      setForm({
        entryPrice: "",
        positionSize: "",
        leverage: "",
        liquidationPrice: "",
        stopLoss: "",
        pnl: ""
      });
      await loadTrades();
    } finally {
      setCreating(false);
    }
  };

  if (!userLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-emerald-400">
              VibeRisk Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Your crypto risk & position sizing overview.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[2fr,3fr]">
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-xs"
          >
            <h2 className="text-sm font-semibold text-emerald-400">
              Log new trade
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-slate-300">Entry price</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={form.entryPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, entryPrice: e.target.value }))
                  }
                  required
                  type="number"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">
                  Position size
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={form.positionSize}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, positionSize: e.target.value }))
                  }
                  required
                  type="number"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">Leverage</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={form.leverage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leverage: e.target.value }))
                  }
                  required
                  type="number"
                  step="0.1"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">
                  Liquidation price
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={form.liquidationPrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      liquidationPrice: e.target.value
                    }))
                  }
                  required
                  type="number"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">Stop loss</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={form.stopLoss}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stopLoss: e.target.value }))
                  }
                  required
                  type="number"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-300">PnL</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                  value={form.pnl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pnl: e.target.value }))
                  }
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="mt-2 w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {creating ? "Saving..." : "Save trade"}
            </button>
          </form>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-200">
              Trades
            </h2>
            {loadingTrades ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Loading trades...
              </div>
            ) : trades.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No trades yet. Log a trade on the left to get started.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {trades.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {t.status === "open" ? "Open" : "Closed"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(t.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-300">
                        <span>Entry: {t.entryPrice}</span>
                        <span>Size: {t.positionSize}</span>
                        <span>Lev: {t.leverage}x</span>
                        <span>SL: {t.stopLoss}</span>
                        <span>LiQ: {t.liquidationPrice}</span>
                        <span
                          className={
                            t.pnl >= 0
                              ? "text-emerald-400 font-medium"
                              : "text-red-400"
                          }
                        >
                          PnL: {t.pnl}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

