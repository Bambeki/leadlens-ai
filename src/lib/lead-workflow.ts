import type { Lead } from "./types";
import type { CRMStatus } from "./types";
import {
  updateCrmStatus,
  updateOutreachStatus,
  addActivity,
  getCrmOverride,
  getOutreachStatus,
  hasOutreachBeenSent,
  type OutreachStatus,
} from "./crm-store";
import { createNotification } from "./notifications";
import {
  createMeetingRecord,
  saveScheduledMeeting,
  getMeetingByLeadId,
  type ScheduledMeeting,
  type MeetingScheduleSource,
} from "./meetings";

export interface MeetingSlotInput {
  label: string;
  scheduledAt: string;
}

export interface LeadWorkflowState {
  outreachStatus: OutreachStatus | null;
  crmStatus: CRMStatus | null;
  meeting: ScheduledMeeting | undefined;
  emailSent: boolean;
  customerResponded: boolean;
  meetingScheduled: boolean;
}

export const EMPTY_LEAD_WORKFLOW_STATE: LeadWorkflowState = {
  outreachStatus: null,
  crmStatus: null,
  meeting: undefined,
  emailSent: false,
  customerResponded: false,
  meetingScheduled: false,
};

function notify(type: Parameters<typeof createNotification>[0], message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("leadlens-notification", {
      detail: createNotification(type, message),
    })
  );
}

const RESPONDED_OUTREACH: OutreachStatus[] = [
  "Replied",
  "Meeting Suggested",
  "Meeting Accepted",
  "Meeting Scheduled",
];

/** Single entry point for scheduling a meeting — keeps CRM, outreach, meeting, and timeline in sync. */
export function completeMeetingSchedule(
  lead: Lead,
  options: {
    slot: MeetingSlotInput;
    source: MeetingScheduleSource;
  }
): ScheduledMeeting {
  const meeting = createMeetingRecord(
    lead,
    options.slot.label,
    options.slot.scheduledAt,
    "Discovery Call",
    {
      autoScheduled: options.source === "customer",
      scheduledBy: options.source,
    }
  );
  saveScheduledMeeting(meeting);

  updateOutreachStatus(lead.id, "Meeting Scheduled");

  if (options.source === "customer") {
    addActivity(lead.id, "meeting_scheduled", "Customer selected meeting time");
    notify("meeting_scheduled", "Meeting scheduled automatically");
  } else {
    addActivity(lead.id, "meeting_accepted", "Meeting accepted");
    notify(
      "meeting_scheduled",
      `New meeting scheduled with ${lead.businessName}`
    );
  }

  updateCrmStatus(lead.id, "Meeting Scheduled");
  addActivity(lead.id, "crm_meeting_scheduled", "CRM moved to Meeting Scheduled");

  return meeting;
}

export function getLeadWorkflowState(leadId: string): LeadWorkflowState {
  const outreachStatus = getOutreachStatus(leadId);
  const crmStatus = getCrmOverride(leadId);
  const meeting = getMeetingByLeadId(leadId);
  const emailSent = hasOutreachBeenSent(leadId);
  const customerResponded =
    (outreachStatus != null && RESPONDED_OUTREACH.includes(outreachStatus)) ||
    meeting != null;
  const meetingScheduled =
    meeting != null || crmStatus === "Meeting Scheduled";

  return {
    outreachStatus,
    crmStatus,
    meeting,
    emailSent,
    customerResponded,
    meetingScheduled,
  };
}

/** Reconcile stored meeting with CRM/outreach when lead detail loads. */
export function syncMeetingWorkflowState(leadId: string): void {
  const meeting = getMeetingByLeadId(leadId);
  if (!meeting) return;

  if (getCrmOverride(leadId) !== "Meeting Scheduled") {
    updateCrmStatus(leadId, "Meeting Scheduled");
  }

  const outreach = getOutreachStatus(leadId);
  if (outreach !== "Meeting Scheduled") {
    updateOutreachStatus(leadId, "Meeting Scheduled");
  }
}
