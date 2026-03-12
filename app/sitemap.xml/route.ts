import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://viberisk-17i6.vercel.app";

const STATIC_PATHS = [
  "/",
  "/risk",
  "/dashboard",
  "/journal",
  "/login",
  "/register",
  "/forgot-password",
  "/privacy",
  "/about",
  "/contact",
] as const;

export async function GET(_req: NextRequest) {
  const urls = STATIC_PATHS.map((path) => {
    const loc = `${BASE_URL}${path}`;
    return `<url><loc>${loc}</loc></url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

