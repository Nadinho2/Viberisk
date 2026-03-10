"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!userLoaded) return;
    const loadTrades = async () => {
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
    void loadTrades();
  }, [userLoaded]);

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
          <form
            action="/api/auth/logout"
            method="post"
            className="inline-block"
          >
            <button
              type="submit"
              className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
            >
              Logout
            </button>
          </form>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-200">Trades</h2>
          {loadingTrades ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading trades...
            </div>
          ) : trades.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No trades yet. Once the trade form is wired, they will appear
              here.
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
      </div>
    </main>
  );
}

