import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";
import { env } from "@/lib/env";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_SUBJECT_LENGTH = 200;
const MAX_NAME_LENGTH = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { message: "Please provide a valid name (max 120 characters)." },
        { status: 400 }
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { message: "Please provide a message (max 2000 characters)." },
        { status: 400 }
      );
    }

    const safeSubject = subject.slice(0, MAX_SUBJECT_LENGTH) || "VibeRisk contact";
    const html = `
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
      <hr />
      <pre style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(message)}</pre>
    `;

    await sendEmail({
      to: env.emailUser,
      subject: `[VibeRisk Contact] ${safeSubject}`,
      html,
    });

    return NextResponse.json({ message: "Message sent." });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { message: "Unable to send message. Try again later or reach out on X." },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
