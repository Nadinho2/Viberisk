"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string)?.trim() || "";
    const email = (data.get("email") as string)?.trim() || "";
    const subject = (data.get("subject") as string)?.trim() || "";
    const body = (data.get("message") as string)?.trim() || "";

    if (!name || !email || !body) {
      setMessage("Please fill in name, email, and message.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message: body }),
      });
      const dataRes = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(dataRes.message || "Something went wrong. Try again or reach out on X.");
        setStatus("error");
        return;
      }

      setStatus("sent");
      setMessage("Message sent. We'll get back to you as soon as we can.");
      form.reset();
    } catch {
      setMessage("Network error. You can reach us on X instead.");
      setStatus("error");
    }
  }

  return (
    <main className="neon-bg min-h-screen px-4 py-8 sm:px-5 sm:py-10 md:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Contact Us
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Questions, feedback, or feature ideas? Send a message or reach out on X.
          </p>
        </header>

        <section className="neon-card-soft space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <span>Follow and DM on X:</span>
            <a
              href="https://x.com/NadinhoCrypto"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#39FF88] hover:underline"
            >
              @NadinhoCrypto
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-xs font-medium text-slate-400">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                maxLength={120}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-[#39FF88]/60 focus:outline-none focus:ring-1 focus:ring-[#39FF88]/40"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-xs font-medium text-slate-400">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={320}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-[#39FF88]/60 focus:outline-none focus:ring-1 focus:ring-[#39FF88]/40"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className="mb-1 block text-xs font-medium text-slate-400">
                Subject <span className="text-slate-500">(optional)</span>
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                maxLength={200}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-[#39FF88]/60 focus:outline-none focus:ring-1 focus:ring-[#39FF88]/40"
                placeholder="e.g. Feature request, bug report"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1 block text-xs font-medium text-slate-400">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                maxLength={2000}
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-[#39FF88]/60 focus:outline-none focus:ring-1 focus:ring-[#39FF88]/40"
                placeholder="Your message..."
              />
            </div>

            {message && (
              <p
                className={`text-sm ${
                  status === "error" ? "text-red-400" : "text-[#39FF88]"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="neon-button-primary disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        </section>

        <p className="text-center text-xs text-slate-500">
          We typically respond within a few days. For urgent issues, a DM on X is fastest.
        </p>

        <div className="flex justify-center">
          <Link href="/about" className="text-sm text-slate-400 hover:text-[#39FF88]">
            ← About VibeRisk
          </Link>
        </div>
      </div>
    </main>
  );
}
