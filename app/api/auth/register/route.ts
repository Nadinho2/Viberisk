import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { env } from "@/lib/env";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().regex(passwordRegex, {
    message:
      "Password must be at least 8 characters and include uppercase, lowercase and a number."
  })
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

  const { username, email, password } = parsed.data;

  const existing = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existing) {
    return NextResponse.json(
      { message: "Username or email already in use" },
      { status: 400 }
    );
  }

  const user = new User({ username, email, password });
  await user.save();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const secure = env.nodeEnv === "production";

  const res = NextResponse.json(
    {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    },
    { status: 201 }
  );

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

