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

export const DEMO_SIMULATION_ENABLED = process.env.NODE_ENV !== "production";

export type WebhookEvent =
  | "email_opened"
  | "customer_replied"
  | "meeting_accepted"
  | "meeting_declined"
  | "email_bounced";

function notify(
  type: Parameters<typeof createNotification>[0],
  message: string,
  simulated = false
) {
  window.dispatchEvent(
    new CustomEvent("leadlens-notification", {
      detail: createNotification(type, message, { simulated }),
    })
  );
}

export async function processEmailSent(
  leadId: string,
  recipient: string
): Promise<void> {
  await updateOutreachStatus(leadId, "Sent");
  addActivity(leadId, "email_sent", "Email sent");
  await updateCrmStatus(leadId, "Contacted");
  addActivity(leadId, "crm_contacted", "Opportunity status moved to Contacted");

  notify("email_sent", `Email delivered to ${recipient} via Resend.`);
  notify("crm_updated", "Opportunity status updated to Contacted");
}

export async function simulateWebhookEvent(
  lead: Lead,
  event: WebhookEvent
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!DEMO_SIMULATION_ENABLED) {
    return {
      ok: false,
      reason: "Demo simulation tools are disabled in production.",
    };
  }

  if (!hasOutreachBeenSent(lead.id)) {
    return {
      ok: false,
      reason: "Send outreach first before running a demo simulation.",
    };
  }

  const name = lead.businessName;

  switch (event) {
    case "email_opened": {
      await updateOutreachStatus(lead.id, "Opened");
      addActivity(lead.id, "email_opened", "Simulated email open");
      notify("email_opened", `Demo simulation: ${name} opened your email.`, true);
      return { ok: true };
    }

    case "customer_replied": {
      await updateOutreachStatus(lead.id, "Replied");
      addActivity(lead.id, "email_replied", "Simulated customer reply");
      await updateCrmStatus(lead.id, "Responded");
      addActivity(
        lead.id,
        "crm_responded",
        "Opportunity status moved to Responded by demo simulation"
      );
      notify(
        "email_replied",
        `Demo simulation: ${lead.contact.name} at ${name} replied.`,
        true
      );
      notify("crm_updated", "Demo simulation moved opportunity to Responded", true);
      return { ok: true };
    }

    case "meeting_accepted": {
      const slot = getMeetingSlotOptions()[0];
      await completeMeetingSchedule(lead, {
        slot: {
          label: slot?.label ?? "Discovery Call",
          scheduledAt: slot?.scheduledAt ?? new Date().toISOString(),
        },
        source: "simulator",
      });
      return { ok: true };
    }

    case "meeting_declined": {
      await updateOutreachStatus(lead.id, "Meeting Declined");
      addActivity(lead.id, "meeting_declined", "Simulated meeting declined");
      await updateCrmStatus(lead.id, "Lost");
      addActivity(
        lead.id,
        "crm_lost",
        "Opportunity status moved to Lost by demo simulation"
      );
      notify(
        "crm_updated",
        `Demo simulation: ${name} declined the meeting — opportunity status moved to Lost.`,
        true
      );
      return { ok: true };
    }

    case "email_bounced": {
      await updateOutreachStatus(lead.id, "Bounced");
      addActivity(lead.id, "email_bounced", "Simulated email bounce");
      await updateCrmStatus(lead.id, "Lost");
      addActivity(
        lead.id,
        "crm_lost",
        "Opportunity status moved to Lost by demo simulation"
      );
      notify(
        "crm_updated",
        `Demo simulation: email to ${name} bounced — opportunity status moved to Lost.`,
        true
      );
      return { ok: true };
    }
  }
}
