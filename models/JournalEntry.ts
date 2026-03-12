import mongoose, { Schema, Document } from "mongoose";

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;
  // Section 1
  pair: string;
  direction: "long" | "short";
  exchange: string;
  primaryTimeframe: string;
  higherTimeframe: string;
  entryPrice?: number;
  currentPrice?: number;
  entryType?: "limit" | "market";
  // Section 2
  marketRegime: string;
  htfBias: string;
  catalyst?: string;
  catalystDate?: Date;
  sentiment: "bullish" | "bearish" | "neutral";
  drawdownContext?: string;
  // Section 3
  strategyType: string;
  confluenceFactors: string[];
  entryRationale: string;
  invalidationReason: string;
  keyLevels: string[];
  // Section 4
  accountRiskPercent: number;
  positionSize?: number;
  impliedLeverage?: number;
  liquidationPrice?: number;
  stopLossPrice: number;
  stopLossRationale?: string;
  tpLevels: { price: number; percent: number }[];
  riskRewardRatio?: number;
  trailingPlan?: string;
  // Section 5
  confidence: number;
  mindset: string;
  rulesChecklist: { rule: string; passed: boolean; notes?: string }[];
  emotionalNotes?: string;
  // Section 6
  chartUrl?: string;
  tags: string[];
  preTradeNotes?: string;
  // Meta
  confluenceScore?: number;
  missed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const journalSchema = new Schema<IJournalEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pair: { type: String, required: true },
    direction: { type: String, enum: ["long", "short"], required: true },
    exchange: { type: String, required: true },
    primaryTimeframe: { type: String, required: true },
    higherTimeframe: { type: String, required: true },
    entryPrice: { type: Number },
    currentPrice: { type: Number },
    entryType: { type: String, enum: ["limit", "market"] },
    marketRegime: { type: String, required: true },
    htfBias: { type: String, required: true },
    catalyst: { type: String },
    catalystDate: { type: Date },
    sentiment: {
      type: String,
      enum: ["bullish", "bearish", "neutral"],
      required: true
    },
    drawdownContext: { type: String },
    strategyType: { type: String, required: true },
    confluenceFactors: { type: [String], default: [] },
    entryRationale: { type: String, required: true },
    invalidationReason: { type: String, required: true },
    keyLevels: { type: [String], default: [] },
    accountRiskPercent: { type: Number, required: true },
    positionSize: { type: Number },
    impliedLeverage: { type: Number },
    liquidationPrice: { type: Number },
    stopLossPrice: { type: Number, required: true },
    stopLossRationale: { type: String },
    tpLevels: {
      type: [
        {
          price: Number,
          percent: Number
        }
      ],
      default: []
    },
    riskRewardRatio: { type: Number },
    trailingPlan: { type: String },
    confidence: { type: Number, min: 1, max: 10, required: true },
    mindset: { type: String, required: true },
    rulesChecklist: {
      type: [
        {
          rule: String,
          passed: Boolean,
          notes: String
        }
      ],
      default: []
    },
    emotionalNotes: { type: String },
    chartUrl: { type: String },
    tags: { type: [String], default: [] },
    preTradeNotes: { type: String },
    confluenceScore: { type: Number },
    missed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const JournalEntry =
  mongoose.models.JournalEntry ||
  mongoose.model<IJournalEntry>("JournalEntry", journalSchema);

