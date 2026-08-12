import type { CRMStatus, Lead } from "./types";
import type { OutreachStatus, ActivityEvent } from "./crm-store";
import type { ConversationMessage } from "./conversation-store";
import type { OutreachDraft } from "./email";
import type { ScheduledMeeting } from "./meetings";
import type { GeneratedOutreachDraft } from "./outreach";

type OutreachMessageApi = {
  id: string;
  direction?: "INBOUND" | "OUTBOUND" | "inbound" | "outbound";
  subject?: string | null;
  body?: string | null;
  statusText?: string | null;
  sentAt?: string | null;
  createdAt?: string | null;
  providerMessageId?: string | null;
};

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

export async function fetchOpportunityActivityFromApi(
  opportunityId: string
): Promise<ActivityEvent[]> {
  const res = await fetch(`/api/opportunities/${opportunityId}/status`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch opportunity activity");
  const data = await res.json();
  return Array.isArray(data.activity) ? data.activity : [];
}

export async function fetchOutreachMessagesFromApi(
  opportunityId: string
): Promise<ConversationMessage[]> {
  const res = await fetch(`/api/opportunities/${opportunityId}/outreach`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch outreach messages");
  const data = await res.json();
  const messages: OutreachMessageApi[] = Array.isArray(data.outreachMessages)
    ? data.outreachMessages
    : [];
  return messages
    .filter((message) => !String(message.statusText ?? "").startsWith("activity:"))
    .filter((message) =>
      !["Drafted", "Approved", "Follow-up Draft"].includes(message.statusText ?? "")
    )
    .map((message) => ({
      id: String(message.id),
      direction: message.direction === "INBOUND" || message.direction === "inbound" ? "inbound" : "outbound",
      subject: message.subject ?? undefined,
      body: String(message.body ?? ""),
      author: message.direction === "INBOUND" || message.direction === "inbound" ? "Customer" : "LeadLens AI",
      timestamp: String(message.sentAt ?? message.createdAt ?? new Date().toISOString()),
      messageId: message.providerMessageId ?? undefined,
    }));
}

export async function fetchOutreachDraftFromApi(
  opportunityId: string
): Promise<OutreachDraft | null> {
  const res = await fetch(`/api/opportunities/${opportunityId}/outreach`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch outreach draft");
  const data = await res.json();
  const messages: OutreachMessageApi[] = Array.isArray(data.outreachMessages)
    ? data.outreachMessages
    : [];
  const draft = messages.find((message) =>
    ["Drafted", "Approved"].includes(String(message.statusText ?? ""))
  );

  if (!draft) return null;
  return {
    subject: draft.subject ?? "",
    body: draft.body ?? "",
    updatedAt: draft.createdAt ?? new Date().toISOString(),
  };
}

export async function fetchOutreachStatusFromApi(
  opportunityId: string
): Promise<OutreachStatus | null> {
  const res = await fetch(`/api/opportunities/${opportunityId}/outreach`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch outreach status");
  const data = await res.json();
  const messages: OutreachMessageApi[] = Array.isArray(data.outreachMessages)
    ? data.outreachMessages
    : [];
  const validStatuses: OutreachStatus[] = [
    "Drafted",
    "Approved",
    "Sent",
    "Opened",
    "Replied",
    "Meeting Suggested",
    "Meeting Accepted",
    "Meeting Scheduled",
    "Meeting Declined",
    "Bounced",
  ];
  const status = messages.find((message) =>
    validStatuses.includes(message.statusText as OutreachStatus)
  )?.statusText;
  return typeof status === "string" ? (status as OutreachStatus) : null;
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

export async function saveOutreachDraftToApi(
  opportunityId: string,
  payload: {
    subject: string;
    body: string;
    status: Extract<OutreachStatus, "Drafted" | "Approved">;
  }
) {
  return saveOutreachMessageToApi(opportunityId, {
    direction: "outbound",
    subject: payload.subject,
    body: payload.body,
    statusText: payload.status,
  });
}

export async function generateOutreachDraftFromApi(
  opportunityId: string
): Promise<GeneratedOutreachDraft> {
  const res = await fetch(`/api/opportunities/${opportunityId}/outreach/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to generate outreach draft");
  const data = await res.json();
  return data.draft as GeneratedOutreachDraft;
}

export async function saveActivityToApi(
  opportunityId: string,
  activity: ActivityEvent
) {
  return saveOutreachMessageToApi(opportunityId, {
    direction: "outbound",
    body: activity.label,
    statusText: `activity:${activity.type}`,
    sentAt: activity.timestamp,
  });
}

export async function fetchMeetingsFromApi(): Promise<ScheduledMeeting[]> {
  const res = await fetch("/api/meetings", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meetings");
  const data = await res.json();
  return Array.isArray(data.meetings) ? data.meetings : [];
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
  const data = await res.json();
  return data.meeting as ScheduledMeeting;
}
