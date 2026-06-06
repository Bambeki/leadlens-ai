import { FEATURED_LEAD_ID, getFeaturedLead } from "./mock-data";
import { clearImportedLeads } from "./imported-leads";
import {
  updateCrmStatus,
  updateOutreachStatus,
  addActivity,
} from "./crm-store";
import { saveScheduledMeeting } from "./meetings";
import { saveOutreachDraft } from "./email";
import { generateOutreachEmail } from "./outreach";

const SEED_VERSION_KEY = "leadlens-demo-seed-v2";

/** One-time presentation seed: curated data + DHL success story */
export function seedPresentationDemo(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_VERSION_KEY) === "done") return;

  clearImportedLeads();

  const lead = getFeaturedLead();
  const origin = window.location.origin;

  updateCrmStatus(FEATURED_LEAD_ID, "Meeting Scheduled");
  updateOutreachStatus(FEATURED_LEAD_ID, "Meeting Scheduled");

  const email = generateOutreachEmail(lead, origin);
  const subject = email.match(/^Subject:\s*(.+)$/m)?.[1]?.trim() ?? "Vehicle Branding Opportunity";
  const body = email.replace(/^Subject:\s*.+\n*/m, "").trim();
  saveOutreachDraft(FEATURED_LEAD_ID, { subject, body });

  const meetingDate = new Date();
  meetingDate.setDate(meetingDate.getDate() + 3);
  meetingDate.setHours(10, 0, 0, 0);

  saveScheduledMeeting({
    id: "demo-dhl-meeting",
    leadId: FEATURED_LEAD_ID,
    businessName: lead.businessName,
    contactName: lead.contact.name,
    contactRole: lead.contact.role,
    scheduledAt: meetingDate.toISOString(),
    displayTime: `${meetingDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} 10:00`,
    meetingType: "Vehicle branding consultation",
    crmStatus: "Meeting Scheduled",
    leadScore: lead.scoreBreakdown.total,
    autoScheduled: true,
    scheduledBy: "customer",
  });

  const activities: { type: Parameters<typeof addActivity>[1]; label: string }[] = [
    { type: "email_drafted", label: "Outreach email drafted" },
    { type: "email_approved", label: "Outreach approved" },
    { type: "email_sent", label: "Outreach email sent" },
    { type: "email_opened", label: "Email opened by prospect" },
    { type: "email_replied", label: "DHL replied — interested in vehicle wrap" },
    { type: "crm_responded", label: "Moved to Responded" },
    { type: "meeting_scheduled", label: "Meeting scheduled — vehicle branding consultation" },
    { type: "crm_meeting_scheduled", label: "CRM updated to Meeting Scheduled" },
  ];

  for (const a of activities) {
    addActivity(FEATURED_LEAD_ID, a.type, a.label);
  }

  localStorage.setItem(SEED_VERSION_KEY, "done");
}
