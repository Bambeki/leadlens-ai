import type { CRMStatus, Lead, OpportunityListScope } from "./types";
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

const STATUS_ONLY_MESSAGES = [
  "Sent",
  "Opened",
  "Replied",
  "Meeting Suggested",
  "Meeting Accepted",
  "Meeting Scheduled",
  "Meeting Declined",
  "Bounced",
];

async function readApiJson(res: Response) {
  return res.json().catch(() => ({}));
}

function apiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data == null) return fallback;
  const payload = data as { diagnostic?: unknown; error?: unknown };
  return typeof payload.diagnostic === "string"
    ? payload.diagnostic
    : typeof payload.error === "string"
      ? payload.error
      : fallback;
}

export async function fetchOpportunitiesFromApi(
  scope: OpportunityListScope = "active"
): Promise<Lead[]> {
  const res = await fetch(`/api/opportunities?scope=${scope}`, { cache: "no-store" });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to fetch opportunities"));
  }
  return Array.isArray(data.opportunities) ? (data.opportunities as Lead[]) : [];
}

export async function updateOpportunityLifecycleInApi(
  opportunityId: string,
  action: "archive" | "restore"
): Promise<Lead> {
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/lifecycle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to update opportunity"));
  }
  return (data as { opportunity: Lead }).opportunity;
}

export async function deleteOpportunityInApi(
  opportunityId: string,
  confirmName: string
): Promise<void> {
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/lifecycle`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: true, confirmName }),
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to delete opportunity"));
  }
}

export async function fetchOpportunityFromApi(
  opportunityId: string
): Promise<Lead | null> {
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}`, {
    cache: "no-store",
  });
  const data = await readApiJson(res);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to fetch opportunity"));
  }
  return (data as { opportunity?: Lead }).opportunity ?? null;
}

export type SaveOpportunitiesResult = {
  opportunities: Lead[];
  imported: Lead[];
  suppressed: Lead[];
};

export async function saveOpportunitiesToApi(leads: Lead[]): Promise<SaveOpportunitiesResult> {
  const res = await fetch("/api/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunities: leads }),
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to save opportunities"));
  }
  return {
    opportunities: Array.isArray(data.opportunities) ? data.opportunities : [],
    imported: Array.isArray(data.imported) ? data.imported : [],
    suppressed: Array.isArray(data.suppressed) ? data.suppressed : [],
  };
}

export async function updateOpportunityStatusInApi(
  opportunityId: string,
  status: CRMStatus,
  note?: string
) {
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note }),
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to update opportunity status"));
  }
  return data;
}

export async function fetchOpportunityActivityFromApi(
  opportunityId: string
): Promise<ActivityEvent[]> {
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/status`, {
    cache: "no-store",
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to fetch opportunity activity"));
  }
  return Array.isArray(data.activity) ? data.activity : [];
}

export async function fetchOutreachMessagesFromApi(
  opportunityId: string
): Promise<ConversationMessage[]> {
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/outreach`, {
    cache: "no-store",
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to fetch outreach messages"));
  }
  const messages: OutreachMessageApi[] = Array.isArray(data.outreachMessages)
    ? data.outreachMessages
    : [];
  return messages
    .filter((message) => !String(message.statusText ?? "").startsWith("activity:"))
    .filter((message) =>
      !["Drafted", "Approved", "Follow-up Draft"].includes(message.statusText ?? "")
    )
    .filter((message) => {
      const status = String(message.statusText ?? "");
      const body = String(message.body ?? "");
      return !(
        STATUS_ONLY_MESSAGES.includes(status) &&
        !message.subject &&
        body === status
      );
    })
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
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/outreach`, {
    cache: "no-store",
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to fetch outreach draft"));
  }
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
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/outreach`, {
    cache: "no-store",
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to fetch outreach status"));
  }
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
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/outreach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to save outreach message"));
  }
  return data;
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

export type OutreachAssistAction =
  | "generate"
  | "improve"
  | "professional"
  | "shorter"
  | "rewrite"
  | "personalize";

export async function generateOutreachDraftFromApi(
  opportunityId: string,
  payload: {
    action?: OutreachAssistAction;
    subject?: string;
    body?: string;
  } = {}
): Promise<GeneratedOutreachDraft> {
  const res = await fetch(`/api/opportunities/${opportunityId}/outreach/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readApiJson(res);
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, "Failed to generate outreach draft"));
  }
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
  const data = await readApiJson(res);
  if (!res.ok) throw new Error(apiErrorMessage(data, "Failed to fetch meetings"));
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
  const id = encodeURIComponent(opportunityId);
  const res = await fetch(`/api/opportunities/${id}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readApiJson(res);
  if (!res.ok) throw new Error(apiErrorMessage(data, "Failed to save meeting"));
  return data.meeting as ScheduledMeeting;
}
