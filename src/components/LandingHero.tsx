"use client";

import Link from "next/link";
import { DemoModeButton } from "./DemoMode";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-saas-bg to-saas-bg" />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-1.5 text-sm font-medium text-violet-400 ring-1 ring-violet-500/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          Live Demo
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
          AI-Powered B2B Lead Discovery for{" "}
          <span className="saas-gradient-text">Vehicle Branding</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Discover logistics prospects, score vehicle branding gaps, send outreach,
          and book meetings — all in one platform.
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
