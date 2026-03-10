import { Request, Response } from "express";
import createHttpError from "http-errors";
import { z } from "zod";
import { User } from "../models/User";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE
} from "../middleware/authMiddleware";
import {
  signAccessToken,
  signPasswordResetToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyResetToken
} from "../utils/jwt";
import { env } from "../config/env";
import { sendEmail } from "../utils/sendEmail";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().regex(passwordRegex, {
      message:
        "Password must be at least 8 characters and include uppercase, lowercase and a number."
    })
  })
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3),
    password: z.string().min(8)
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    identifier: z.string().min(3)
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    password: z.string().regex(passwordRegex, {
      message:
        "Password must be at least 8 characters and include uppercase, lowercase and a number."
    })
  })
});

const setAuthCookies = (res: Response, accessToken: string, refresh: string) => {
  const secure = env.nodeEnv === "production";

  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    domain: env.cookieDomain,
    maxAge: 1000 * 60 * 60 // 1 hour cap; JWT expiry still enforced
  });

  res.cookie(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    domain: env.cookieDomain,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existing) {
    throw createHttpError(400, "Username or email already in use");
  }

  const user = new User({ username, email, password });
  await user.save();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
};

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }]
  });
  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createHttpError(401, "Invalid credentials");
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie(ACCESS_COOKIE, {
    domain: env.cookieDomain
  });
  res.clearCookie(REFRESH_COOKIE, {
    domain: env.cookieDomain
  });
  res.status(204).send();
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) {
    throw createHttpError(401, "Missing refresh token");
  }

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw createHttpError(401, "Invalid refresh token");
  }

  // rotation: bump tokenVersion and reissue tokens
  user.tokenVersion += 1;
  await user.save();

  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user);
  setAuthCookies(res, newAccess, newRefresh);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { identifier } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }]
  });

  if (!user) {
    // Do not reveal existence; respond success anyway
    return res.json({ message: "If that account exists, an email was sent." });
  }

  const token = signPasswordResetToken(user);
  const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(
    token
  )}`;

  user.resetToken = token;
  user.resetExpires = new Date(
    Date.now() + env.resetTokenExpiresInMinutes * 60 * 1000
  );
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "VibeRisk password reset",
    html: `<p>You requested a password reset for your VibeRisk account.</p>
           <p>Click the link below to reset your password (valid for ${env.resetTokenExpiresInMinutes} minutes):</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>`
  });

  res.json({ message: "If that account exists, an email was sent." });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const payload = verifyResetToken(token);
  const user = await User.findOne({
    _id: payload.sub,
    resetToken: token,
    resetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw createHttpError(400, "Invalid or expired reset token");
  }

  if (user.password !== payload.passwordHash) {
    throw createHttpError(400, "Reset token no longer valid");
  }

  user.password = password;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful. Please log in." });
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
};

