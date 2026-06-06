"use client";

import Link from "next/link";
import { DemoModeButton } from "./DemoMode";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 to-white" />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          Hackathon MVP — Live Demo
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          AI-Powered B2B Lead Discovery for{" "}
          <span className="text-indigo-600">Vehicle Branding</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Find fleet branding opportunities, score trades & logistics leads, and
          close wrap projects — without leaving LeadLens.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <DemoModeButton variant="hero" />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30"
          >
            Launch Dashboard
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Try Fleet Branding Analyzer
          </Link>
        </div>
      </div>
    </section>
  );
}
