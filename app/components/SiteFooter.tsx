"use client";

import React from "react";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950/80 py-4">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-xs text-zinc-500 sm:text-sm">
          by{" "}
          <a
            href="https://x.com/NadinhoCrypto"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition hover:text-[#39FF88]"
          >
            @NadinhoCrypto
          </a>
        </p>
      </div>
    </footer>
  );
}
