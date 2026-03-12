"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/risk", label: "Risk Calculator" },
  { href: "/journal", label: "Trade Journal" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.35)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo – link to home */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/viberisk-logo.png"
              alt="VibeRisk"
              width={40}
              height={40}
              className="rounded-md shadow-[0_0_18px_rgba(57,255,136,0.8)]"
              priority
            />
            <span className="neon-logo-text hover:opacity-90">VibeRisk</span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-6 md:flex lg:gap-8"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition ${
                  pathname === href
                    ? "text-[#39FF88]"
                    : "text-zinc-400 hover:text-[#39FF88]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {!loading && !user && (
              <Link
                href="/login"
                className="neon-button-secondary"
              >
                Sign in
              </Link>
            )}
            {!loading && user && (
              <>
                <Link
                  href="/dashboard"
                  className="neon-button-primary"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Hamburger button – mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition hover:bg-zinc-800 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`h-0.5 w-5 bg-current transition ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-current transition ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-current transition ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm transition-opacity md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        className={`fixed top-14 right-0 z-40 flex w-full max-w-xs flex-col border-b border-l border-zinc-800 bg-zinc-900 shadow-xl transition-transform duration-200 ease-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col py-2" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`px-5 py-3.5 text-sm font-medium transition ${
                pathname === href
                  ? "bg-zinc-800 text-[#39FF88]"
                  : "text-zinc-300 hover:bg-zinc-800/80 hover:text-[#39FF88]"
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="mt-2 flex flex-col gap-2 px-5 pb-4 pt-2 border-t border-zinc-800">
            {!loading && !user && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-[#39FF88]/60 px-3 py-2 text-center text-xs font-medium text-[#39FF88] hover:bg-[#39FF88]/10"
              >
                Login
              </Link>
            )}
            {!loading && user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-[#39FF88] px-3 py-2 text-center text-xs font-medium text-zinc-950 hover:bg-[#58ff9c]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setMenuOpen(false);
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-center text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
