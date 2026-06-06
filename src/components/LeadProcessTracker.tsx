"use client";

import { useEffect, useState } from "react";
import { CRM_UPDATED_EVENT, type OutreachStatus } from "@/lib/crm-store";
import { MEETINGS_UPDATED_EVENT } from "@/lib/meetings";
import {
  EMPTY_LEAD_WORKFLOW_STATE,
  getLeadWorkflowState,
  syncMeetingWorkflowState,
  type LeadWorkflowState,
} from "@/lib/lead-workflow";
import { formatMeetingDate, formatMeetingTime } from "@/lib/meetings";
import { useHasMounted } from "@/hooks/useHasMounted";

const PROCESS_STEPS = [
  {
    id: "email_sent",
    label: "Outreach Sent",
    detail: (s: LeadWorkflowState) =>
      s.emailSent ? "Email delivered to lead" : "Send outreach to begin",
  },
  {
    id: "customer_responded",
    label: "Customer Responded",
    detail: (s: LeadWorkflowState) =>
      s.customerResponded
        ? s.outreachStatus
          ? `Outreach: ${s.outreachStatus}`
          : "Customer engaged via response link"
        : "Awaiting customer reply",
  },
  {
    id: "meeting_scheduled",
    label: "Meeting Scheduled",
    detail: (s: LeadWorkflowState) => {
      if (!s.meeting) {
        return s.meetingScheduled
          ? "CRM updated — meeting confirmed"
          : "Awaiting customer to pick a time";
      }
      return `${formatMeetingDate(s.meeting.scheduledAt)} at ${formatMeetingTime(s.meeting.scheduledAt)}`;
    },
  },
] as const;

function stepComplete(
  stepId: (typeof PROCESS_STEPS)[number]["id"],
  state: LeadWorkflowState
): boolean {
  switch (stepId) {
    case "email_sent":
      return state.emailSent;
    case "customer_responded":
      return state.customerResponded;
    case "meeting_scheduled":
      return state.meetingScheduled;
  }
}

function ProcessTrackerSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Process Tracker
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Auto-updates from outreach, CRM, and saved meetings
          </p>
        </div>
        <span className="h-6 w-28 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {PROCESS_STEPS.map((step) => (
          <div
            key={step.id}
            className="min-w-[140px] animate-pulse rounded-lg bg-slate-100 px-4 py-3"
          >
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}

export default function LeadProcessTracker({ leadId }: { leadId: string }) {
  const hasMounted = useHasMounted();
  const [state, setState] = useState<LeadWorkflowState>(EMPTY_LEAD_WORKFLOW_STATE);

  useEffect(() => {
    if (!hasMounted) return;
    syncMeetingWorkflowState(leadId);
    const refresh = () => setState(getLeadWorkflowState(leadId));
    refresh();
    window.addEventListener(CRM_UPDATED_EVENT, refresh);
    window.addEventListener(MEETINGS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(CRM_UPDATED_EVENT, refresh);
      window.removeEventListener(MEETINGS_UPDATED_EVENT, refresh);
    };
  }, [leadId, hasMounted]);

  if (!hasMounted) {
    return <ProcessTrackerSkeleton />;
  }

  const completedCount = PROCESS_STEPS.filter((s) =>
    stepComplete(s.id, state)
  ).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Process Tracker
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Auto-updates from outreach, CRM, and saved meetings
          </p>
        </div>
        {state.meetingScheduled && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Meeting Scheduled
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {PROCESS_STEPS.map((step, i) => {
          const complete = stepComplete(step.id, state);
          const active =
            !complete &&
            (i === 0 || stepComplete(PROCESS_STEPS[i - 1].id, state));
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex min-w-[140px] flex-col rounded-lg px-4 py-3 text-sm transition-all ${
                  complete
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-400 ring-1 ring-slate-200"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  {complete && (
                    <span className="text-emerald-600" aria-hidden>
                      ✓
                    </span>
                  )}
                  {step.label}
                </span>
                <span
                  className={`mt-1 text-xs ${
                    complete
                      ? "text-emerald-700"
                      : active
                        ? "text-indigo-100"
                        : "text-slate-400"
                  }`}
                >
                  {step.detail(state)}
                </span>
              </div>
              {i < PROCESS_STEPS.length - 1 && (
                <svg
                  className="h-4 w-4 shrink-0 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
          style={{
            width: `${(completedCount / PROCESS_STEPS.length) * 100}%`,
          }}
        />
      </div>

      {state.meeting && (
        <p className="mt-3 text-xs text-emerald-700">
          ✓ Meeting saved — {state.meeting.displayTime}
          {state.meeting.autoScheduled !== false && (
            <span className="text-slate-500">
              {" "}
              · Auto-scheduled by customer
            </span>
          )}
        </p>
      )}

      {state.outreachStatus && (
        <p className="mt-2 text-xs text-slate-400">
          Workflow status:{" "}
          <span className="font-medium text-slate-600">
            {state.outreachStatus as OutreachStatus}
          </span>
        </p>
      )}
    </div>
  );
}
