import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/client";
import { Trade, TradeList } from "../components/TradeList";
import { TradeForm } from "../components/TradeForm";

export const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ trades: Trade[] }>("/trades");
      setTrades(res.data.trades);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrades();
  }, []);

  const stats = useMemo(() => {
    if (!trades.length) {
      return { totalPnL: 0, winRate: 0, count: 0 };
    }
    const closed = trades.filter((t) => t.status === "closed");
    const wins = closed.filter((t) => t.pnl > 0).length;
    const totalPnL = trades.reduce((acc, t) => acc + (t.pnl ?? 0), 0);
    const winRate = closed.length ? (wins / closed.length) * 100 : 0;
    return { totalPnL, winRate, count: trades.length };
  }, [trades]);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-emerald-400">VibeRisk</h1>
          <p className="text-xs text-slate-400">
            Crypto risk & position sizing dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          {user && (
            <span className="rounded-full bg-slate-900/70 px-3 py-1">
              {user.username}
            </span>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <div className="space-y-4">
          <div className="card p-4 text-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Overview
            </h2>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Total trades</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">
                  {stats.count}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Win rate</p>
                <p className="mt-1 text-lg font-semibold text-emerald-400">
                  {stats.winRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-slate-400">Total PnL</p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    stats.totalPnL >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {stats.totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <TradeForm onCreated={loadTrades} />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="card flex min-h-[200px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            <TradeList trades={trades} onDeleted={loadTrades} />
          )}
        </div>
      </section>
    </div>
  );
};

