import type { Lead } from "./types";
import {
  updateCrmStatus,
  updateOutreachStatus,
  addActivity,
  hasOutreachBeenSent,
} from "./crm-store";
import { createNotification } from "./notifications";
import { completeMeetingSchedule } from "./lead-workflow";
import { getMeetingSlotOptions } from "./customer-response";

export type WebhookEvent =
  | "email_opened"
  | "customer_replied"
  | "meeting_accepted"
  | "meeting_declined"
  | "email_bounced";

function notify(type: Parameters<typeof createNotification>[0], message: string) {
  window.dispatchEvent(
    new CustomEvent("leadlens-notification", {
      detail: createNotification(type, message),
    })
  );
}

export function processEmailSent(
  leadId: string,
  recipient: string
): void {
  updateOutreachStatus(leadId, "Sent");
  addActivity(leadId, "email_sent", "Email sent");
  updateCrmStatus(leadId, "Contacted");
  addActivity(leadId, "crm_contacted", "Opportunity status moved to Contacted");

  notify("email_sent", `Email delivered to ${recipient} via Resend.`);
  notify("crm_updated", "Opportunity status updated to Contacted");
}

export function simulateWebhookEvent(
  lead: Lead,
  event: WebhookEvent
): { ok: true } | { ok: false; reason: string } {
  if (!hasOutreachBeenSent(lead.id)) {
    return {
      ok: false,
      reason: "Send outreach first — webhooks fire after email delivery.",
    };
  }

  const name = lead.businessName;

  switch (event) {
    case "email_opened": {
      updateOutreachStatus(lead.id, "Opened");
      addActivity(lead.id, "email_opened", "Email opened");
      notify("email_opened", `${name} opened your email (Resend webhook).`);
      return { ok: true };
    }

    case "customer_replied": {
      updateOutreachStatus(lead.id, "Replied");
      addActivity(lead.id, "email_replied", "Customer replied");
      updateCrmStatus(lead.id, "Responded");
      addActivity(lead.id, "crm_responded", "Opportunity status moved to Responded");
      notify(
        "email_replied",
        `${lead.contact.name} at ${name} replied (Resend inbound webhook).`
      );
      notify("crm_updated", "Opportunity status moved to Responded");
      return { ok: true };
    }

    case "meeting_accepted": {
      const slot = getMeetingSlotOptions()[0];
      completeMeetingSchedule(lead, {
        slot: {
          label: slot?.label ?? "Discovery Call",
          scheduledAt: slot?.scheduledAt ?? new Date().toISOString(),
        },
        source: "simulator",
      });
      return { ok: true };
    }

    case "meeting_declined": {
      updateOutreachStatus(lead.id, "Meeting Declined");
      addActivity(lead.id, "meeting_declined", "Meeting declined");
      updateCrmStatus(lead.id, "Lost");
      addActivity(lead.id, "crm_lost", "Opportunity status moved to Lost");
      notify(
        "crm_updated",
        `${name} declined the meeting — opportunity status moved to Lost.`
      );
      return { ok: true };
    }

    case "email_bounced": {
      updateOutreachStatus(lead.id, "Bounced");
      addActivity(lead.id, "email_bounced", "Email bounced");
      updateCrmStatus(lead.id, "Lost");
      addActivity(lead.id, "crm_lost", "Opportunity status moved to Lost");
      notify(
        "crm_updated",
        `Email to ${name} bounced — opportunity status moved to Lost.`
      );
      return { ok: true };
    }
  }
}
