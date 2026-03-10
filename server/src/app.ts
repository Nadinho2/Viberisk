import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { notFound, errorHandler } from "./middleware/errorHandler";
import { authRateLimiter } from "./middleware/rateLimit";
import authRoutes from "./routes/auth.routes";
import tradeRoutes from "./routes/trade.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/trades", tradeRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

