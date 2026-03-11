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
  category?: "active" | "concluded" | "missed";
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [userLoaded, setUserLoaded] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setLoading(true);
    try {
      const res = await fetch("/api/trades", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTrades(data.trades || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded]);

  const handlePnlChange = (id: string, value: string) => {
    setTrades((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, pnl: value === "" ? 0 : Number(value) } : t
      )
    );
  };

  const handleSaveOutcome = async (id: string, pnl: number) => {
    setSavingId(id);
    try {
      await fetch(`/api/trades/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "closed", pnl })
      });
      await loadTrades();
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/trades/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      await loadTrades();
    } finally {
      setDeletingId(null);
    }
  };

  if (!userLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </main>
    );
  }

  const closedTrades = trades.filter((t) => t.status === "closed");
  const totalClosedPnl = closedTrades.reduce(
    (sum, t) => sum + (t.pnl ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-5">
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

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <h2 className="text-sm font-semibold text-slate-200">Trades</h2>
            <p
              className={`text-sm font-semibold ${
                totalClosedPnl >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              Total closed PnL: {totalClosedPnl.toFixed(2)}
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading trades...
            </div>
          ) : trades.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No trades yet. Log trades from the Risk Calculator – they will
              appear here.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="min-w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Entry</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Lev</th>
                    <th className="px-3 py-2">SL</th>
                    <th className="px-3 py-2">Liq</th>
                    <th className="px-3 py-2">PnL</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr
                      key={t._id}
                      className="border-t border-slate-800/80 odd:bg-slate-900/40"
                    >
                      <td className="px-3 py-2 align-top text-[0.7rem] text-slate-400">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 align-top text-[0.7rem]">
                        {t.status}
                      </td>
                      <td className="px-3 py-2 align-top text-[0.7rem]">
                        {t.category || "active"}
                      </td>
                      <td className="px-3 py-2 align-top text-[0.7rem]">
                        {t.entryPrice}
                      </td>
                      <td className="px-3 py-2 align-top text-[0.7rem]">
                        {t.positionSize}
                      </td>
                      <td className="px-3 py-2 align-top text-[0.7rem]">
                        {t.leverage}x
                      </td>
                      <td className="px-3 py-2 align-top text-[0.7rem]">
                        {t.stopLoss}
                      </td>
                      <td className="px-3 py-2 align-top text-[0.7rem]">
                        {t.liquidationPrice}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          step="0.01"
                          value={t.pnl ?? ""}
                          onChange={(e) =>
                            handlePnlChange(t._id, e.target.value)
                          }
                          className="w-20 rounded border border-slate-700 bg-slate-950/70 px-2 py-1 text-[0.7rem] text-slate-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveOutcome(t._id, t.pnl ?? 0)
                            }
                            disabled={savingId === t._id}
                            className="rounded border border-slate-700 px-2 py-1 text-[0.7rem] text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                          >
                            {savingId === t._id ? "Saving..." : "Save outcome"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTrade(t._id)}
                            disabled={deletingId === t._id}
                            className="rounded border border-red-500/60 px-2 py-1 text-[0.7rem] text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                          >
                            {deletingId === t._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}