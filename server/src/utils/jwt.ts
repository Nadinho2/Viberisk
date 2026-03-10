import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { IUser } from "../models/User";

export interface JwtPayload {
  sub: string;
  username: string;
  tokenVersion: number;
}

export interface ResetJwtPayload {
  sub: string;
  passwordHash: string;
}

export const signAccessToken = (user: IUser): string => {
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    tokenVersion: user.tokenVersion
  };

  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpiresIn
  });
};

export const signRefreshToken = (user: IUser): string => {
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    tokenVersion: user.tokenVersion
  };

  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiresIn
  });
};

export const signPasswordResetToken = (user: IUser): string => {
  const payload: ResetJwtPayload = {
    sub: user.id,
    passwordHash: user.password
  };

  return jwt.sign(payload, env.jwtResetSecret, {
    expiresIn: `${env.resetTokenExpiresInMinutes}m`
  });
};

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtAccessSecret) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;

export const verifyResetToken = (token: string): ResetJwtPayload =>
  jwt.verify(token, env.jwtResetSecret) as ResetJwtPayload;

