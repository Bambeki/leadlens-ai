"use client";

import Link from "next/link";
import { DemoModeButton } from "./DemoMode";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-saas-bg to-saas-bg" />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 text-center">
        <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300 ring-1 ring-white/5">
          Startup Hackathon – AI for Mittelhessen
        </div>

        <p className="text-sm text-slate-500">
          Challenge inspired by Weimar Beschriftung
        </p>

        <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
          AI-Powered B2B Lead Discovery for{" "}
          <span className="saas-gradient-text">Vehicle Branding</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Discover vehicle branding opportunities, qualify high-value business
          leads, generate outreach, and book meetings — all in one platform.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <DemoModeButton variant="hero" />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-600/30"
          >
            Launch Dashboard
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 rounded-xl border border-saas-border bg-saas-card px-8 py-3.5 text-base font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Vehicle Branding Audit
          </Link>
        </div>
      </div>
    </section>
  );
}
