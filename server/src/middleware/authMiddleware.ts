import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/User";

const ACCESS_COOKIE_NAME = "viberisk_access_token";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    const cookieToken = req.cookies?.[ACCESS_COOKIE_NAME] as
      | string
      | undefined;

    const token = bearerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const ACCESS_COOKIE = ACCESS_COOKIE_NAME;
export const REFRESH_COOKIE = "viberisk_refresh_token";

