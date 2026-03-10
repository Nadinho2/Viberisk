import { FormEvent, useState } from "react";
import { api } from "../api/client";

export interface TradeInput {
  entryPrice: number;
  positionSize: number;
  leverage: number;
  liquidationPrice: number;
  stopLoss: number;
  pnl?: number;
  status?: "open" | "closed";
}

interface Props {
  onCreated: () => void;
}

export const TradeForm = ({ onCreated }: Props) => {
  const [form, setForm] = useState<TradeInput>({
    entryPrice: 0,
    positionSize: 0,
    leverage: 1,
    liquidationPrice: 0,
    stopLoss: 0,
    pnl: 0,
    status: "open"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof TradeInput, value: number | string) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        typeof value === "string" && value !== "" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/trades", {
        ...form,
        takeProfits: [] // can be extended later
      });
      onCreated();
      setForm({
        entryPrice: 0,
        positionSize: 0,
        leverage: 1,
        liquidationPrice: 0,
        stopLoss: 0,
        pnl: 0,
        status: "open"
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to create trade.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card p-4 space-y-3" onSubmit={handleSubmit}>
      <h2 className="text-sm font-semibold text-emerald-400">
        Log new trade
      </h2>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="mb-1 block text-slate-300">Entry price</label>
          <input
            className="input"
            type="number"
            value={form.entryPrice || ""}
            onChange={(e) => update("entryPrice", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-slate-300">Position size</label>
          <input
            className="input"
            type="number"
            value={form.positionSize || ""}
            onChange={(e) => update("positionSize", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-slate-300">Leverage</label>
          <input
            className="input"
            type="number"
            value={form.leverage || ""}
            onChange={(e) => update("leverage", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-slate-300">
            Liquidation price
          </label>
          <input
            className="input"
            type="number"
            value={form.liquidationPrice || ""}
            onChange={(e) => update("liquidationPrice", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-slate-300">Stop loss</label>
          <input
            className="input"
            type="number"
            value={form.stopLoss || ""}
            onChange={(e) => update("stopLoss", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-slate-300">PnL</label>
          <input
            className="input"
            type="number"
            value={form.pnl ?? ""}
            onChange={(e) => update("pnl", e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400" aria-live="polite">
          {error}
        </p>
      )}

      <button className="btn-primary w-full text-xs" disabled={loading}>
        {loading ? "Saving..." : "Save trade"}
      </button>
    </form>
  );
};

