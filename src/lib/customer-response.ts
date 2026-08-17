import type { Lead } from "./types";
import {
  updateCrmStatus,
  updateOutreachStatus,
  addActivity,
} from "./crm-store";
import { createNotification } from "./notifications";
import { completeMeetingSchedule } from "./lead-workflow";
import { getPublicAppBaseUrl, toCanonicalAbsoluteUrl } from "./public-app-url";

export type CustomerAction = "interested" | "schedule" | "declined";

export interface MeetingSlot {
  id: string;
  label: string;
  scheduledAt: string;
}

export function getCustomerResponsePaths(token: string) {
  return {
    interested: `/r/${token}?action=interested`,
    schedule: `/r/${token}?action=schedule`,
    declined: `/r/${token}?action=not_interested`,
    hub: `/r/${token}`,
  };
}

/** Relative paths by default; absolute URLs use the canonical public origin. */
export function getCustomerResponseUrls(token: string, baseUrl?: string) {
  const paths = getCustomerResponsePaths(token);
  const origin = getPublicAppBaseUrl(baseUrl);
  if (!origin) {
    return paths;
  }
  return {
    interested: `${origin}${paths.interested}`,
    schedule: `${origin}${paths.schedule}`,
    declined: `${origin}${paths.declined}`,
    hub: `${origin}${paths.hub}`,
  };
}

export function toAbsoluteResponseUrl(path: string): string {
  return toCanonicalAbsoluteUrl(path);
}

export function getMeetingSlotOptions(): MeetingSlot[] {
  const now = new Date();

  function atTime(base: Date, hour: number, minute: number): Date {
    const d = new Date(base);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  function nextFriday(): Date {
    const d = new Date(now);
    const day = d.getDay();
    const daysUntil = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntil);
    return d;
  }

  function nextMonday(): Date {
    const d = new Date(now);
    const day = d.getDay();
    const daysUntil = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
    d.setDate(d.getDate() + daysUntil);
    return d;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const slots: MeetingSlot[] = [
    {
      id: "tomorrow-10",
      label: "Tomorrow 10:00",
      scheduledAt: atTime(tomorrow, 10, 0).toISOString(),
    },
    {
      id: "tomorrow-14",
      label: "Tomorrow 14:00",
      scheduledAt: atTime(tomorrow, 14, 0).toISOString(),
    },
    {
      id: "friday-11",
      label: "Friday 11:00",
      scheduledAt: atTime(nextFriday(), 11, 0).toISOString(),
    },
    {
      id: "monday-0930",
      label: "Monday 09:30",
      scheduledAt: atTime(nextMonday(), 9, 30).toISOString(),
    },
  ];

  return slots;
}

function notify(type: Parameters<typeof createNotification>[0], message: string) {
  window.dispatchEvent(
    new CustomEvent("leadlens-notification", {
      detail: createNotification(type, message),
    })
  );
}

export async function processCustomerInterested(lead: Lead): Promise<void> {
  await updateOutreachStatus(lead.id, "Replied");
  addActivity(lead.id, "email_replied", "Customer clicked Request a Call");
  await updateCrmStatus(lead.id, "Responded");
  addActivity(lead.id, "crm_responded", "Opportunity status moved to Responded");
  notify(
    "email_replied",
    `${lead.businessName} is interested — requested a call.`
  );
  notify("crm_updated", "Customer is interested");
}

export async function processCustomerDeclined(lead: Lead): Promise<void> {
  await updateOutreachStatus(lead.id, "Meeting Declined");
  addActivity(lead.id, "meeting_declined", "Customer clicked Not Interested");
  await updateCrmStatus(lead.id, "Lost");
  addActivity(lead.id, "crm_lost", "Opportunity status moved to Lost");
  notify("crm_updated", `${lead.businessName} declined the offer.`);
}

export async function processCustomerMeetingScheduled(
  lead: Lead,
  slot: MeetingSlot
): Promise<void> {
  await completeMeetingSchedule(lead, {
    slot: { label: slot.label, scheduledAt: slot.scheduledAt },
    source: "customer",
  });
}

export function buildEmailCtaBlock(token: string, baseUrl?: string): string {
  const urls = getCustomerResponseUrls(token, baseUrl);
  return `
──────────────────────────────
Are you interested?

[Request a Call]
${urls.interested}

[Choose a Meeting Time]
${urls.schedule}

Not interested? Let us know here.
${urls.declined}
──────────────────────────────`;
}
