import { Request, Response } from "express";
import createHttpError from "http-errors";
import { z } from "zod";
import { Trade } from "../models/Trade";

export const createTradeSchema = z.object({
  body: z.object({
    entryPrice: z.number().positive(),
    positionSize: z.number().positive(),
    leverage: z.number().positive(),
    liquidationPrice: z.number().positive(),
    takeProfits: z
      .array(
        z.object({
          price: z.number().positive(),
          percent: z.number().min(0).max(100)
        })
      )
      .optional()
      .default([]),
    stopLoss: z.number().positive(),
    pnl: z.number().optional().default(0),
    status: z.enum(["open", "closed"]).optional().default("open"),
    closedAt: z.coerce.date().optional()
  })
});

export const getTrades = async (req: Request, res: Response) => {
  if (!req.user) {
    throw createHttpError(401, "Unauthorized");
  }

  const trades = await Trade.find({ userId: req.user.id }).sort({
    createdAt: -1
  });

  res.json({ trades });
};

export const createTrade = async (req: Request, res: Response) => {
  if (!req.user) {
    throw createHttpError(401, "Unauthorized");
  }

  const trade = await Trade.create({
    ...req.body,
    userId: req.user.id
  });

  res.status(201).json({ trade });
};

export const deleteTrade = async (req: Request, res: Response) => {
  if (!req.user) {
    throw createHttpError(401, "Unauthorized");
  }

  const trade = await Trade.findById(req.params.id);
  if (!trade) {
    throw createHttpError(404, "Trade not found");
  }

  if (trade.userId.toString() !== req.user.id) {
    throw createHttpError(403, "Forbidden");
  }

  await trade.deleteOne();
  res.status(204).send();
};

