import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  createTrade,
  createTradeSchema,
  deleteTrade,
  getTrades
} from "../controllers/tradeController";

const router = Router();

router.use(authMiddleware);

router.get("/", getTrades);
router.post("/", validate(createTradeSchema), createTrade);
router.delete("/:id", deleteTrade);

export default router;

