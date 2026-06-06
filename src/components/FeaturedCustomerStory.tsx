"use client";

import Link from "next/link";
import { FEATURED_LEAD_ID, getFeaturedLead } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/scoring";
import PriorityBadge from "./PriorityBadge";

const STORY_STEPS = [
  { label: "Imported", done: true },
  { label: "Qualified", done: true },
  { label: "Branding Gap Found", done: true },
  { label: "Outreach Sent", done: true },
  { label: "Meeting Booked", done: true },
];

export default function FeaturedCustomerStory() {
  const lead = getFeaturedLead();

  return (
    <div className="saas-gradient-border mb-8 overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-saas-card to-saas-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Featured Customer Journey
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">{lead.businessName}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {lead.industry} · {lead.city} · Est.{" "}
            {formatCurrency((lead.estimatedValue.min + lead.estimatedValue.max) / 2)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={lead.priority} />
          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/25">
            Meeting Scheduled
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STORY_STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="text-emerald-500">✓</span>
              {step.label}
            </span>
            {i < STORY_STEPS.length - 1 && (
              <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        DHL Fleet Services was imported, scored, and flagged for a major vehicle
        branding opportunity. Outreach was sent, the prospect replied, and a
        consultation is booked — the full LeadLens workflow in action.
      </p>

      <Link
        href={`/leads/${FEATURED_LEAD_ID}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300"
      >
        View full lead story
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}
