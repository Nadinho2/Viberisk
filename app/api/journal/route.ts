import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { JournalEntry } from "@/models/JournalEntry";
import { verifyAccessToken } from "@/lib/jwt";

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("viberisk_access_token")?.value;
  if (!token) return null;
  try {
    const payload = verifyAccessToken(token);
    return payload.sub;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  await connectDb();

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entries = await JournalEntry.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  await connectDb();

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Basic validation for required fields; UI enforces more
  if (!body.pair || !body.direction || !body.exchange) {
    return NextResponse.json(
      { message: "Pair, direction, and exchange are required." },
      { status: 400 }
    );
  }

  const doc = await JournalEntry.create({
    ...body,
    userId
  });

  return NextResponse.json({ entry: doc }, { status: 201 });
}

