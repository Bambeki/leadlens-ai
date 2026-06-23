import type { Lead } from "./types";

export const FEATURED_LEAD_ID = "";

export const leads: Lead[] = [];

export function getLeadById(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id);
}

export function getFeaturedLead(): Lead | undefined {
  return leads.find((l) => l.id === FEATURED_LEAD_ID) ?? leads[0];
}

export function getDashboardStats() {
  return {
    total: leads.length,
    qualified: leads.filter((l) => l.priority === "High" || l.scoreBreakdown.total >= 55).length,
    outreachSent: leads.filter((l) =>
      ["Contacted", "Responded", "Meeting Scheduled", "Won"].includes(l.crmStatus)
    ).length,
    meetingsBooked: leads.filter((l) =>
      ["Meeting Scheduled", "Won"].includes(l.crmStatus)
    ).length,
    high: leads.filter((l) => l.priority === "High").length,
    medium: leads.filter((l) => l.priority === "Medium").length,
    low: leads.filter((l) => l.priority === "Low").length,
  };
}

export function getPipelineStats() {
  const stats = getDashboardStats();
  return {
    ...stats,
    discovered: leads.length,
    qualified: stats.qualified,
    analyzed: leads.length,
    contactsFound: leads.length,
    outreachReady: stats.outreachSent,
    pipelineValue: leads
      .filter((l) => !["Lost", "Won"].includes(l.crmStatus))
      .reduce((s, l) => s + (l.estimatedValue.min + l.estimatedValue.max) / 2, 0),
  };
}
