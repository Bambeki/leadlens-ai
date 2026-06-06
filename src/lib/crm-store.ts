import type { CRMStatus, Lead } from "./types";
import { CRM_STATUSES } from "./crm";
import { getImportedLeads, saveImportedLeads } from "./imported-leads";
import { uniqueId } from "./unique-id";

export const CRM_UPDATED_EVENT = "leadlens-crm-updated";

export type OutreachStatus =
  | "Drafted"
  | "Approved"
  | "Sent"
  | "Opened"
  | "Replied"
  | "Meeting Suggested"
  | "Meeting Accepted"
  | "Meeting Scheduled"
  | "Meeting Declined"
  | "Bounced";

export type ActivityType =
  | "email_drafted"
  | "email_approved"
  | "email_sent"
  | "crm_contacted"
  | "email_opened"
  | "email_replied"
  | "crm_responded"
  | "meeting_scheduled"
  | "meeting_accepted"
  | "meeting_declined"
  | "email_bounced"
  | "crm_meeting_scheduled"
  | "crm_lost"
  | "crm_manual_update";

export const SENT_OUTREACH_STATUSES: OutreachStatus[] = [
  "Sent",
  "Opened",
  "Replied",
  "Meeting Suggested",
  "Meeting Accepted",
  "Meeting Scheduled",
  "Meeting Declined",
  "Bounced",
];

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  label: string;
  timestamp: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function crmKey(leadId: string) {
  return `leadlens-crm-${leadId}`;
}

function outreachKey(leadId: string) {
  return `leadlens-outreach-${leadId}`;
}

function activityKey(leadId: string) {
  return `leadlens-activity-${leadId}`;
}

export function getCrmOverride(leadId: string): CRMStatus | null {
  if (!isBrowser()) return null;
  const saved = localStorage.getItem(crmKey(leadId)) as CRMStatus | null;
  return saved && CRM_STATUSES.includes(saved) ? saved : null;
}

export function getAllCrmOverrides(leadIds?: string[]): Record<string, CRMStatus> {
  if (!isBrowser()) return {};
  const map: Record<string, CRMStatus> = {};

  if (leadIds) {
    for (const id of leadIds) {
      const status = getCrmOverride(id);
      if (status) map[id] = status;
    }
    return map;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("leadlens-crm-")) continue;
    const id = key.replace("leadlens-crm-", "");
    const status = localStorage.getItem(key) as CRMStatus;
    if (CRM_STATUSES.includes(status)) map[id] = status;
  }
  return map;
}

export function getEffectiveCrmStatus(lead: Lead): CRMStatus {
  return getCrmOverride(lead.id) ?? lead.crmStatus;
}

export function applyCrmOverridesToLeads(leads: Lead[]): Lead[] {
  return leads.map((lead) => ({
    ...lead,
    crmStatus: getEffectiveCrmStatus(lead),
  }));
}

function syncImportedLeadCrm(leadId: string, status: CRMStatus) {
  const imported = getImportedLeads();
  const idx = imported.findIndex((l) => l.id === leadId);
  if (idx < 0) return false;
  imported[idx] = { ...imported[idx], crmStatus: status };
  saveImportedLeads(imported);
  return true;
}

export function updateCrmStatus(leadId: string, status: CRMStatus): void {
  if (!isBrowser()) return;
  if (!CRM_STATUSES.includes(status)) return;

  localStorage.setItem(crmKey(leadId), status);
  syncImportedLeadCrm(leadId, status);

  window.dispatchEvent(
    new CustomEvent(CRM_UPDATED_EVENT, {
      detail: { leadId, status },
    })
  );
}

export function getOutreachStatus(leadId: string): OutreachStatus | null {
  if (!isBrowser()) return null;
  const saved = localStorage.getItem(outreachKey(leadId));
  if (!saved) return null;
  const valid: OutreachStatus[] = [
    "Drafted",
    "Approved",
    ...SENT_OUTREACH_STATUSES,
  ];
  return valid.includes(saved as OutreachStatus)
    ? (saved as OutreachStatus)
    : null;
}

export function updateOutreachStatus(
  leadId: string,
  status: OutreachStatus
): void {
  if (!isBrowser()) return;
  localStorage.setItem(outreachKey(leadId), status);
  window.dispatchEvent(
    new CustomEvent(CRM_UPDATED_EVENT, {
      detail: { leadId, outreachStatus: status },
    })
  );
}

export function getActivityTimeline(leadId: string): ActivityEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(activityKey(leadId));
    return raw ? (JSON.parse(raw) as ActivityEvent[]) : [];
  } catch {
    return [];
  }
}

export function addActivity(
  leadId: string,
  type: ActivityType,
  label: string
): ActivityEvent {
  const event: ActivityEvent = {
    id: uniqueId("act-"),
    type,
    label,
    timestamp: new Date().toISOString(),
  };

  if (!isBrowser()) return event;

  const existing = getActivityTimeline(leadId);
  localStorage.setItem(
    activityKey(leadId),
    JSON.stringify([...existing, event])
  );

  window.dispatchEvent(
    new CustomEvent(CRM_UPDATED_EVENT, {
      detail: { leadId, activity: event },
    })
  );

  return event;
}

export function hasOutreachBeenSent(leadId: string): boolean {
  const status = getOutreachStatus(leadId);
  return status != null && SENT_OUTREACH_STATUSES.includes(status);
}
