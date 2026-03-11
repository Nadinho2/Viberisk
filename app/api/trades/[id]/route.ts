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

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDb();

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const trade = await Trade.findById(id);
  if (!trade) {
    return NextResponse.json({ message: "Trade not found" }, { status: 404 });
  }

  if (trade.userId.toString() !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await trade.deleteOne();
  return NextResponse.json({}, { status: 204 });
}

