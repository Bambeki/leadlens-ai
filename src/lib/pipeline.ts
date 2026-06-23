import type { Lead, PipelineStage } from "./types";
import { CRM_STATUSES } from "./crm";

export const PIPELINE_STAGE_DEFS = [
  {
    id: "discovery" as const,
    label: "Discovery",
    description: "Vehicle branding prospects identified from market data",
  },
  {
    id: "qualification" as const,
    label: "Qualification",
    description: "AI scoring and lead prioritization",
  },
  {
    id: "opportunity" as const,
    label: "Opportunity Analysis",
    description: "Vehicle branding gaps and source evidence",
  },
  {
    id: "outreach" as const,
    label: "Outreach",
    description: "Personalized email campaigns sent",
  },
  {
    id: "meeting" as const,
    label: "Meeting",
    description: "Consultations scheduled with prospects",
  },
  {
    id: "won" as const,
    label: "Won",
    description: "Customer opportunity converted",
  },
];

export function getPipelineStages(leads: Lead[]): PipelineStage[] {
  const outreachCount = leads.filter((l) =>
    ["Contacted", "Responded", "Meeting Scheduled", "Won"].includes(l.crmStatus)
  ).length;
  const meetingCount = leads.filter((l) =>
    ["Meeting Scheduled", "Won"].includes(l.crmStatus)
  ).length;
  const wonCount = leads.filter((l) => l.crmStatus === "Won").length;

  const counts: Record<string, number> = {
    discovery: leads.length,
    qualification: leads.filter(
      (l) => l.priority === "High" || l.scoreBreakdown.total >= 55
    ).length,
    opportunity: leads.filter((l) => l.factors.brandingOpportunity).length,
    outreach: outreachCount,
    meeting: meetingCount,
    won: wonCount,
  };

  return PIPELINE_STAGE_DEFS.map((stage) => ({
    ...stage,
    count: counts[stage.id] ?? leads.length,
  }));
}

export function getCrmBreakdown(leads: Lead[]) {
  return CRM_STATUSES.map((status) => ({
    status,
    count: leads.filter((l) => l.crmStatus === status).length,
  }));
}

export function getPipelineValue(leads: Lead[]) {
  const active = leads.filter(
    (l) => !["Lost", "Won"].includes(l.crmStatus)
  );
  return active.reduce(
    (sum, l) => sum + (l.estimatedValue.min + l.estimatedValue.max) / 2,
    0
  );
}
