import mongoose, { Document, Schema, Types } from "mongoose";

export type TradeStatus = "open" | "closed";

export interface ITakeProfit {
  price: number;
  percent: number;
}

export interface ITrade extends Document {
  userId: Types.ObjectId;
  entryPrice: number;
  positionSize: number;
  leverage: number;
  liquidationPrice: number;
  takeProfits: ITakeProfit[];
  stopLoss: number;
  pnl: number;
  status: TradeStatus;
  createdAt: Date;
  closedAt?: Date;
}

const takeProfitSchema = new Schema<ITakeProfit>(
  {
    price: { type: Number, required: true },
    percent: { type: Number, required: true }
  },
  { _id: false }
);

const tradeSchema = new Schema<ITrade>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    entryPrice: { type: Number, required: true },
    positionSize: { type: Number, required: true },
    leverage: { type: Number, required: true },
    liquidationPrice: { type: Number, required: true },
    takeProfits: { type: [takeProfitSchema], default: [] },
    stopLoss: { type: Number, required: true },
    pnl: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true
    },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date }
  },
  { timestamps: true }
);

export const Trade =
  mongoose.models.Trade || mongoose.model<ITrade>("Trade", tradeSchema);

