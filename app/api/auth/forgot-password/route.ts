import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { signPasswordResetToken } from "@/lib/jwt";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  await connectDb();

  const { identifier } = (await req.json().catch(() => ({}))) as {
    identifier?: string;
  };

  if (!identifier) {
    return NextResponse.json(
      { message: "Identifier (email or username) is required" },
      { status: 400 }
    );
  }

  const query =
    identifier.includes("@") ? { email: identifier } : { username: identifier };

  const user = await User.findOne(query);

  // Always return success message to avoid leaking which accounts exist
  if (!user) {
    return NextResponse.json(
      {
        message:
          "If that account exists, a reset link has been sent to the email on file."
      },
      { status: 200 }
    );
  }

  try {
    const token = signPasswordResetToken(user);
    const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your VibeRisk password",
      html: `
        <p>Hi ${user.username},</p>
        <p>We received a request to reset your VibeRisk password.</p>
        <p>
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">
            Click here to reset your password
          </a>
        </p>
        <p>This link will expire in ${
          env.resetTokenExpiresInMinutes
        } minutes. If you did not request this, you can safely ignore this email.</p>
      `
    });

    return NextResponse.json(
      {
        message:
          "If that account exists, a reset link has been sent to the email on file."
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error sending reset email", err);
    return NextResponse.json(
      { message: "Unable to send reset email. Please try again later." },
      { status: 500 }
    );
  }
}

