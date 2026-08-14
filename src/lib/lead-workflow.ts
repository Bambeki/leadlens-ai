import type { Lead } from "./types";
import type { CRMStatus } from "./types";
import {
  updateCrmStatus,
  updateOutreachStatus,
  addActivity,
  getCrmOverride,
  getOutreachStatus,
  getOutreachStatusFromDb,
  type OutreachStatus,
} from "./crm-store";
import { fetchOpportunityFromApi } from "./opportunity-api";
import { createNotification } from "./notifications";
import {
  createMeetingRecord,
  saveScheduledMeeting,
  getMeetingByLeadId,
  getScheduledMeetingsFromDb,
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

/** Single entry point for scheduling a meeting to keep status, outreach, meeting, and timeline in sync. */
export function completeMeetingSchedule(
  lead: Lead,
  options: {
    slot: MeetingSlotInput;
    source: MeetingScheduleSource;
  }
): Promise<ScheduledMeeting> {
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
  return saveScheduledMeeting(meeting).then(async (saved) => {
    await updateOutreachStatus(lead.id, "Meeting Scheduled");
    await updateCrmStatus(lead.id, "Meeting Scheduled");

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

    addActivity(
      lead.id,
      "crm_meeting_scheduled",
      "Opportunity status moved to Meeting Scheduled"
    );

    return saved;
  });
}

export function getLeadWorkflowState(leadId: string): LeadWorkflowState {
  const outreachStatus = getOutreachStatus(leadId);
  const crmStatus = getCrmOverride(leadId);
  const meeting = getMeetingByLeadId(leadId);
  const emailSent = outreachStatus === "Sent";
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

export async function getLeadWorkflowStateFromDb(
  leadId: string
): Promise<LeadWorkflowState> {
  try {
    const [outreachStatus, meetings] = await Promise.all([
      getOutreachStatusFromDb(leadId),
      getScheduledMeetingsFromDb(),
    ]);
    const opportunity = await fetchOpportunityFromApi(leadId);
    const meeting = meetings.find((item) => item.leadId === leadId);
    const crmStatus = opportunity?.crmStatus ?? meeting?.crmStatus ?? null;
    const emailSent = outreachStatus === "Sent";
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
  } catch {
    return getLeadWorkflowState(leadId);
  }
}
