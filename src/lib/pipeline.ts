import type { Lead, PipelineStage } from "./types";
import { CRM_STATUSES } from "./crm";

export const PIPELINE_STAGE_DEFS = [
  {
    id: "discovery" as const,
    label: "Discovery",
    description: "Businesses collected from Google Maps",
  },
  {
    id: "qualification" as const,
    label: "Qualification",
    description: "AI lead scoring & prioritization",
  },
  {
    id: "opportunity" as const,
    label: "Opportunity Analysis",
    description: "Vehicle branding intelligence & fleet opportunity detection",
  },
  {
    id: "contact" as const,
    label: "Contact Discovery",
    description: "Decision-maker identification",
  },
  {
    id: "outreach" as const,
    label: "Outreach",
    description: "Personalized email generation",
  },
  {
    id: "crm" as const,
    label: "CRM Tracking",
    description: "Pipeline status management",
  },
];

export function getPipelineStages(leads: Lead[]): PipelineStage[] {
  const crmActive = leads.filter(
    (l) => l.crmStatus !== "Not Contacted"
  ).length;

  return PIPELINE_STAGE_DEFS.map((stage) => ({
    ...stage,
    count:
      stage.id === "crm"
        ? crmActive
        : leads.length,
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
