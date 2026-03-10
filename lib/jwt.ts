import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "./env";
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
    sub: (user as any)._id?.toString() ?? "",
    username: user.username,
    tokenVersion: user.tokenVersion
  };

  const options: SignOptions = {
    expiresIn: env.accessTokenExpiresIn as unknown as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwtAccessSecret as Secret, options);
};

export const signRefreshToken = (user: IUser): string => {
  const payload: JwtPayload = {
    sub: (user as any)._id?.toString() ?? "",
    username: user.username,
    tokenVersion: user.tokenVersion
  };

  const options: SignOptions = {
    expiresIn: env.refreshTokenExpiresIn as unknown as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwtRefreshSecret as Secret, options);
};

export const signPasswordResetToken = (user: IUser): string => {
  const payload: ResetJwtPayload = {
    sub: (user as any)._id?.toString() ?? "",
    passwordHash: user.password
  };

  const options: SignOptions = {
    expiresIn: `${env.resetTokenExpiresInMinutes}m` as unknown as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwtResetSecret as Secret, options);
};

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtAccessSecret as Secret) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtRefreshSecret as Secret) as JwtPayload;

export const verifyResetToken = (token: string): ResetJwtPayload =>
  jwt.verify(token, env.jwtResetSecret as Secret) as ResetJwtPayload;

