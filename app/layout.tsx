import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Position & Risk Calculator",
  description:
    "Professional crypto position sizing, risk calculator, and live charts for BTC, ETH, SOL, BNB, XAUT.",
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
        <SiteHeader />
        <main className="flex-1 pt-14 sm:pt-16">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
