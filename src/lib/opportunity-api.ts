import type { CRMStatus, Lead } from "./types";

export async function fetchOpportunitiesFromApi(): Promise<Lead[]> {
  const res = await fetch("/api/opportunities", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  const data = await res.json();
  return Array.isArray(data.opportunities) ? data.opportunities : [];
}

export async function saveOpportunitiesToApi(leads: Lead[]): Promise<Lead[]> {
  const res = await fetch("/api/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunities: leads }),
  });
  if (!res.ok) throw new Error("Failed to save opportunities");
  const data = await res.json();
  return Array.isArray(data.opportunities) ? data.opportunities : [];
}

export async function updateOpportunityStatusInApi(
  opportunityId: string,
  status: CRMStatus,
  note?: string
) {
  const res = await fetch(`/api/opportunities/${opportunityId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error("Failed to update opportunity status");
  return res.json();
}

export async function saveOutreachMessageToApi(
  opportunityId: string,
  payload: {
    direction?: "outbound" | "inbound";
    subject?: string;
    body: string;
    html?: string;
    recipientEmail?: string;
    provider?: string;
    providerMessageId?: string;
    statusText?: string;
    sentAt?: string;
  }
) {
  const res = await fetch(`/api/opportunities/${opportunityId}/outreach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save outreach message");
  return res.json();
}

export async function saveMeetingToApi(
  opportunityId: string,
  payload: {
    contactName: string;
    contactRole: string;
    scheduledAt: string;
    displayTime: string;
    meetingType: string;
    autoScheduled?: boolean;
    scheduledBy?: string;
  }
) {
  const res = await fetch(`/api/opportunities/${opportunityId}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save meeting");
  return res.json();
}
