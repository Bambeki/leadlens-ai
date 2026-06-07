"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoModeButton } from "./DemoMode";

const HERO_BACKGROUND = "/images/hero/background.jpg";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={HERO_BACKGROUND}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-saas-bg/88 to-saas-bg" />
        <div className="absolute inset-0 bg-violet-950/25" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-20 text-center">
        <h1 className="mx-auto max-w-5xl">
          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-violet-300/90 sm:text-sm">
            Startup Hackathon 2026
          </span>
          <span className="mt-4 block text-3xl font-bold uppercase leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)] sm:text-4xl lg:text-5xl">
            <span className="saas-gradient-text">AI for</span>{" "}
            <span className="text-white">Mittelhessen</span>
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">
          Challenge inspired by Weimar Beschriftung
        </p>

        <h2 className="mx-auto mt-10 max-w-3xl text-2xl font-bold tracking-tight text-slate-200 sm:text-3xl">
          AI-Powered B2B Lead Discovery for{" "}
          <span className="saas-gradient-text">Vehicle Branding</span>
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
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
