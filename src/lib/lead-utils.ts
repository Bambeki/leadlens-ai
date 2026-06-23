import type { CRMStatus, Lead, Priority } from "./types";

export type LeadFilter =
  | "all"
  | Priority
  | CRMStatus;

export type SortField =
  | "score"
  | "revenue"
  | "crmStatus"
  | "city"
  | "priority";

export type SortDirection = "asc" | "desc";

export function getEstimatedRevenue(lead: Lead): number {
  return (lead.estimatedValue.min + lead.estimatedValue.max) / 2;
}

export function isHighOpportunity(lead: Lead): boolean {
  return (
    lead.priority === "High" ||
    lead.signageAudit.visibilityScore <= 45
  );
}

const PRIORITY_ORDER: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const CRM_ORDER: Record<CRMStatus, number> = {
  "Not Contacted": 0,
  Contacted: 1,
  Responded: 2,
  "Meeting Scheduled": 3,
  Won: 4,
  Lost: 5,
};

export function filterLeads(
  leads: Lead[],
  filter: LeadFilter,
  search: string,
  crmOverrides: Record<string, CRMStatus>
): Lead[] {
  let result = leads.map((lead) => ({
    ...lead,
    crmStatus: crmOverrides[lead.id] ?? lead.crmStatus,
  }));

  if (filter !== "all") {
    if (filter === "High" || filter === "Medium" || filter === "Low") {
      result = result.filter((l) => l.priority === filter);
    } else {
      result = result.filter((l) => l.crmStatus === filter);
    }
  }

  const q = search.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (l) =>
        l.businessName.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.contact.name.toLowerCase().includes(q)
    );
  }

  return result;
}

export function sortLeads(
  leads: Lead[],
  field: SortField,
  direction: SortDirection,
  crmOverrides: Record<string, CRMStatus>
): Lead[] {
  const sorted = [...leads].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "score":
        cmp = a.scoreBreakdown.total - b.scoreBreakdown.total;
        break;
      case "revenue":
        cmp = getEstimatedRevenue(a) - getEstimatedRevenue(b);
        break;
      case "crmStatus": {
        const aStatus = crmOverrides[a.id] ?? a.crmStatus;
        const bStatus = crmOverrides[b.id] ?? b.crmStatus;
        cmp = CRM_ORDER[aStatus] - CRM_ORDER[bStatus];
        break;
      }
      case "city":
        cmp = a.city.localeCompare(b.city);
        break;
      case "priority":
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        break;
    }
    return direction === "asc" ? cmp : -cmp;
  });
  return sorted;
}

export const FILTER_TABS: { id: LeadFilter; label: string; group: "priority" | "crm" | "all" }[] = [
  { id: "all", label: "All Opportunities", group: "all" },
  { id: "High", label: "High Priority", group: "priority" },
  { id: "Medium", label: "Medium Priority", group: "priority" },
  { id: "Low", label: "Low Priority", group: "priority" },
  { id: "Not Contacted", label: "Not Contacted", group: "crm" },
  { id: "Contacted", label: "Contacted", group: "crm" },
  { id: "Responded", label: "Responded", group: "crm" },
  { id: "Meeting Scheduled", label: "Meeting Scheduled", group: "crm" },
  { id: "Won", label: "Won", group: "crm" },
  { id: "Lost", label: "Lost", group: "crm" },
];
