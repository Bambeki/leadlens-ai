"use client";

import { DemoModeButton } from "./DemoMode";

export default function DashboardDemoBanner() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-blue-500/10 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-lg shadow-violet-500/20">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-white">
            Presenting to judges?
          </p>
          <p className="text-sm text-slate-300">
            Run the live demo — discover an electrician, score the fleet, and generate
            outreach in 20 seconds.
          </p>
        </div>
      </div>
      <DemoModeButton variant="primary" />
    </div>
  );
}
