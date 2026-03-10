import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { env } from "@/lib/env";

const schema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(8)
});

export async function POST(req: NextRequest) {
  await connectDb();

  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { identifier, password } = parsed.data;

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }]
  });
  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const secure = env.nodeEnv === "production";

  const res = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });

  res.cookies.set("viberisk_access_token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    domain: env.cookieDomain,
    maxAge: 60 * 60
  });

  res.cookies.set("viberisk_refresh_token", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    domain: env.cookieDomain,
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}

