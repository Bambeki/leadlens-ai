import type { CRMStatus } from "./types";
import { uniqueId } from "./unique-id";

export type MeetingScheduleSource = "customer" | "simulator";

export interface ScheduledMeeting {
  id: string;
  leadId: string;
  businessName: string;
  contactName: string;
  contactRole: string;
  scheduledAt: string;
  displayTime: string;
  meetingType: string;
  crmStatus: CRMStatus;
  leadScore: number;
  autoScheduled?: boolean;
  scheduledBy?: MeetingScheduleSource;
}

const MEETINGS_KEY = "leadlens-meetings";
export const MEETINGS_UPDATED_EVENT = "leadlens-meetings-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getScheduledMeetings(): ScheduledMeeting[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(MEETINGS_KEY);
    return raw ? (JSON.parse(raw) as ScheduledMeeting[]) : [];
  } catch {
    return [];
  }
}

export function saveScheduledMeeting(meeting: ScheduledMeeting): void {
  if (!isBrowser()) return;
  const existing = getScheduledMeetings().filter((m) => m.leadId !== meeting.leadId);
  localStorage.setItem(MEETINGS_KEY, JSON.stringify([meeting, ...existing]));
  window.dispatchEvent(new CustomEvent(MEETINGS_UPDATED_EVENT));
}

export function getMeetingByLeadId(leadId: string): ScheduledMeeting | undefined {
  return getScheduledMeetings().find((m) => m.leadId === leadId);
}

/** @deprecated Use getMeetingByLeadId */
export function getMeetingForLead(leadId: string): ScheduledMeeting | undefined {
  return getMeetingByLeadId(leadId);
}

export function formatMeetingDate(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMeetingTime(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMeetingCountdown(scheduledAt: string): string {
  const diffMs = new Date(scheduledAt).getTime() - Date.now();
  if (diffMs <= 0) return "Meeting started";

  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 1) {
    return `Meeting starts in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  }
  if (diffHours >= 1) {
    return `Meeting starts in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }
  const mins = Math.max(diffMins, 1);
  return `Meeting starts in ${mins} minute${mins === 1 ? "" : "s"}`;
}

export function getUpcomingMeetings(): ScheduledMeeting[] {
  const now = Date.now();
  return getScheduledMeetings()
    .filter((m) => new Date(m.scheduledAt).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
}

export function createMeetingRecord(
  lead: {
    id: string;
    businessName: string;
    contact: { name: string; role: string };
    scoreBreakdown: { total: number };
  },
  displayTime: string,
  scheduledAt: string,
  meetingType = "Discovery Call",
  meta?: { autoScheduled?: boolean; scheduledBy?: MeetingScheduleSource }
): ScheduledMeeting {
  return {
    id: uniqueId("mtg-"),
    leadId: lead.id,
    businessName: lead.businessName,
    contactName: lead.contact.name,
    contactRole: lead.contact.role,
    scheduledAt,
    displayTime,
    meetingType,
    crmStatus: "Meeting Scheduled",
    leadScore: lead.scoreBreakdown.total,
    autoScheduled: meta?.autoScheduled,
    scheduledBy: meta?.scheduledBy,
  };
}
