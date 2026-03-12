import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://viberisk-17i6.vercel.app/sitemap.xml",
    "",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

