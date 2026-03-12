import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://viberisk-17i6.vercel.app"),
  title: "VibeRisk – Crypto Risk Calculator, Trade Journal & Dashboard",
  description:
    "Size crypto positions like a pro with VibeRisk – a free risk calculator, trade journal, and PnL dashboard for BTC, ETH, SOL, BNB, XAUT and more.",
  openGraph: {
    title: "VibeRisk – Crypto Risk Calculator & Trade Journal",
    description:
      "Track your crypto risk, position sizing, trade history and full trade journals in one neon cyberpunk dashboard.",
    images: [
      {
        url: "/viberisk-logo.png",
        width: 1024,
        height: 687,
        alt: "VibeRisk"
      }
    ]
  },
  icons: {
    icon: "/viberisk-logo.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen min-w-0 flex-col antialiased`}
      >
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1 pt-14 sm:pt-16">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
