"use client";

import React from "react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center text-[0.7rem] text-slate-500 sm:flex-row sm:px-6 sm:text-xs">
        <p>
          © 2026{" "}
          <span className="font-semibold text-slate-300">viberisk.xyz</span>
        </p>
        <p>
          Built by{" "}
          <a
            href="https://x.com/NadinhoCrypto"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-[#39FF88]"
          >
            @NadinhoCrypto
          </a>
        </p>
        <p>
          <a
            href="/privacy"
            className="text-slate-300 underline-offset-4 hover:text-[#00f3ff] hover:underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </footer>
  );
}
