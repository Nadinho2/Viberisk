import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Trade } from "@/models/Trade";
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

  const trades = await Trade.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json({ trades });
}

export async function POST(req: NextRequest) {
  await connectDb();

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const trade = await Trade.create({
    ...body,
    userId
  });

  return NextResponse.json({ trade }, { status: 201 });
}

