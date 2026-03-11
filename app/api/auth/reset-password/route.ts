import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { verifyResetToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  await connectDb();

  const { token, password } = (await req.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
  };

  if (!token || !password) {
    return NextResponse.json(
      { message: "Token and new password are required" },
      { status: 400 }
    );
  }

  try {
    const payload = verifyResetToken(token);

    const user = await User.findById(payload.sub);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Extra safety: if password hash has changed since token issued, invalidate
    if (user.password !== payload.passwordHash) {
      return NextResponse.json(
        { message: "Reset token is no longer valid. Please request a new one." },
        { status: 400 }
      );
    }

    user.password = password;
    await user.save();

    return NextResponse.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Reset password error", err);
    return NextResponse.json(
      { message: "Invalid or expired reset token" },
      { status: 400 }
    );
  }
}

