"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PriorityBadge from "@/components/PriorityBadge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import OutreachGenerator from "@/components/OutreachGenerator";
import ConversationCenter from "@/components/ConversationCenter";
import OpportunityInsights from "@/components/OpportunityInsights";
import DiscoverySourceCard from "@/components/DiscoverySourceCard";
import AISignageAudit from "@/components/AISignageAudit";
import ContactDiscovery from "@/components/ContactDiscovery";
import CRMStatusTracker from "@/components/CRMStatusTracker";
import LeadProcessTracker from "@/components/LeadProcessTracker";
import CRMStatusBadge from "@/components/CRMStatusBadge";
import ActivityTimeline from "@/components/ActivityTimeline";
import { useLeadById } from "@/hooks/useAllLeads";
import { useCrmOverrides } from "@/hooks/useCrmOverrides";
import { leads as baseLeads } from "@/lib/mock-data";
import { PIPELINE_STAGE_DEFS } from "@/lib/pipeline";

type LeadTab = "overview" | "conversation";

export default function LeadDetailClient({ id }: { id: string }) {
  const [tab, setTab] = useState<LeadTab>("overview");
  const lead = useLeadById(baseLeads, id);
  const leadIdList = useMemo(
    () => (lead ? [lead.id] : []),
    [lead?.id]
  );
  const overrides = useCrmOverrides(leadIdList);
  const crmStatus = lead
    ? overrides[lead.id] ?? lead.crmStatus
    : null;

  if (!lead || !crmStatus) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold text-white">Lead not found</p>
        <Link href="/dashboard" className="mt-4 inline-block text-violet-400">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/pipeline"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-violet-400"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Pipeline
      </Link>

      {lead.imported && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
          <span className="text-sm text-emerald-300">
            Imported prospect — vehicle branding opportunity identified
          </span>
        </div>
      )}

      <div className="mb-6 overflow-hidden rounded-xl border border-saas-border bg-gradient-to-r from-violet-500/10 to-blue-500/10 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE_STAGE_DEFS.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-2">
              <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <span className="text-xs font-medium text-violet-300">
                {stage.label}
              </span>
              {i < PIPELINE_STAGE_DEFS.length - 1 && (
                <svg className="h-3 w-3 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              {lead.businessName}
            </h1>
            <PriorityBadge priority={lead.priority} />
            <CRMStatusBadge status={crmStatus} />
          </div>
          <p className="mt-2 text-slate-400">
            {lead.industry} · {lead.location}, {lead.city}
          </p>
          {(lead.phone || lead.website) && (
            <p className="mt-1 text-sm text-slate-400">
              {lead.phone && <span>{lead.phone}</span>}
              {lead.phone && lead.website && " · "}
              {lead.website && (
                <span className="text-violet-400">{lead.website}</span>
              )}
            </p>
          )}
        </div>
        <div className="saas-glow-card px-5 py-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-400">
            Lead Score
          </p>
          <p className="text-3xl font-bold text-white">
            {lead.scoreBreakdown.total}
            <span className="text-lg font-normal text-slate-400">/100</span>
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg border border-saas-border bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
            tab === "overview"
              ? "bg-saas-card text-white shadow-sm"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setTab("conversation")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
            tab === "conversation"
              ? "bg-saas-card text-white shadow-sm"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Conversation
        </button>
      </div>

      {tab === "conversation" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ConversationCenter lead={lead} />
          </div>
          <div className="space-y-6">
            <ContactDiscovery contact={lead.contact} />
            <LeadProcessTracker leadId={lead.id} />
            <ActivityTimeline leadId={lead.id} />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <DiscoverySourceCard discovery={lead.discovery} />
            <OpportunityInsights insights={lead.opportunityInsights} />
            <AISignageAudit audit={lead.signageAudit} />
            <ContactDiscovery contact={lead.contact} />
            <LeadProcessTracker leadId={lead.id} />
            <OutreachGenerator lead={lead} />
            <ActivityTimeline leadId={lead.id} />
            <CRMStatusTracker leadId={lead.id} initialStatus={crmStatus} />
          </div>

          <div className="space-y-6">
            <ScoreBreakdown breakdown={lead.scoreBreakdown} />
            <div className="saas-card p-6">
              <h3 className="text-lg font-semibold text-white">
                Quick Summary
              </h3>
              <ul className="mt-4 space-y-2">
                {lead.valuableReasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
