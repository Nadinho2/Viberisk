import dotenv from "dotenv";

dotenv.config();

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  dbUri: required("DB_URI"),
  clientUrl: required("CLIENT_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtResetSecret: required("JWT_RESET_SECRET"),
  emailUser: required("EMAIL_USER"),
  emailPass: required("EMAIL_PASS"),
  cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  resetTokenExpiresInMinutes: parseInt(
    process.env.RESET_TOKEN_EXPIRES_IN_MINUTES || "30",
    10
  )
};
