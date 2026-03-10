import { api } from "../api/client";

export interface Trade {
  _id: string;
  entryPrice: number;
  positionSize: number;
  leverage: number;
  liquidationPrice: number;
  stopLoss: number;
  pnl: number;
  status: "open" | "closed";
  createdAt: string;
  closedAt?: string;
}

interface Props {
  trades: Trade[];
  onDeleted: () => void;
}

export const TradeList = ({ trades, onDeleted }: Props) => {
  const handleDelete = async (id: string) => {
    await api.delete(`/trades/${id}`);
    onDeleted();
  };

  if (!trades.length) {
    return (
      <div className="card p-4 text-sm text-slate-400">
        No trades logged yet. Start by adding one on the left.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
        <span>Recent trades</span>
        <span>{trades.length} total</span>
      </div>
      <div className="space-y-2 text-xs">
        {trades.map((t) => (
          <div
            key={t._id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">
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
                    t.pnl >= 0 ? "text-emerald-400 font-medium" : "text-red-400"
                  }
                >
                  PnL: {t.pnl}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(t._id)}
              className="rounded-md border border-red-500/40 px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

