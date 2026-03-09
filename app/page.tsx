"use client";

import Link from "next/link";
import { CryptoChart } from "./components/CryptoChart";

export default function HomePage() {
  return (
    <>
      {/* Your TradingView live chart component */}
      <CryptoChart />

      {/* Fixed navigation bar on top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold tracking-tighter text-[#39FF88]">
              VibeRisk
            </div>
            <div className="text-xs px-3 py-1 bg-zinc-900 rounded-full text-zinc-400">
              by @NadinhoCrypto
            </div>
          </div>

          <div className="flex gap-8 text-sm font-medium">
            <Link href="/" className="text-[#39FF88] hover:underline">
              Home
            </Link>
            <Link href="/btc-usdt" className="hover:text-[#39FF88] transition">
              BTC
            </Link>
            <Link href="/eth-usdt" className="hover:text-[#39FF88] transition">
              ETH
            </Link>
            <Link href="/sol-usdt" className="hover:text-[#39FF88] transition">
              SOL
            </Link>
            <Link href="/bnb-usdt" className="hover:text-[#39FF88] transition">
              BNB
            </Link>
            <Link href="/xaut-usdt" className="hover:text-[#39FF88] transition">
              XAUT
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}