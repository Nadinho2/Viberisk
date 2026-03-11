import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ message: "Logged out" });

  res.cookies.set("viberisk_access_token", "", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    domain: env.cookieDomain,
    maxAge: 0
  });

  res.cookies.set("viberisk_refresh_token", "", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    domain: env.cookieDomain,
    maxAge: 0
  });

  return res;
}

