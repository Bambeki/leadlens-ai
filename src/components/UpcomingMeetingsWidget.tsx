"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatMeetingCountdown,
  formatMeetingDate,
  formatMeetingTime,
  getUpcomingMeetings,
  MEETINGS_UPDATED_EVENT,
  type ScheduledMeeting,
} from "@/lib/meetings";
import { CRM_UPDATED_EVENT, getCrmOverride } from "@/lib/crm-store";
import CRMStatusBadge from "@/components/CRMStatusBadge";
import type { CRMStatus } from "@/lib/types";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function UpcomingMeetingsWidget() {
  const hasMounted = useHasMounted();
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!hasMounted) return;
    const load = () => {
      const upcoming = getUpcomingMeetings().map((m) => ({
        ...m,
        crmStatus: (getCrmOverride(m.leadId) ?? m.crmStatus) as CRMStatus,
      }));
      setMeetings(upcoming);
    };
    load();
    window.addEventListener(MEETINGS_UPDATED_EVENT, load);
    window.addEventListener(CRM_UPDATED_EVENT, load);
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => {
      window.removeEventListener(MEETINGS_UPDATED_EVENT, load);
      window.removeEventListener(CRM_UPDATED_EVENT, load);
      clearInterval(interval);
    };
  }, [hasMounted]);

  if (!hasMounted) {
    return (
      <div className="saas-card mb-8 overflow-hidden">
        <div className="border-b border-saas-border px-5 py-4">
          <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-white/5" />
        </div>
        <div className="px-5 py-8">
          <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card mb-8 overflow-hidden">
      <div className="flex items-center justify-between border-b border-saas-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
            <CalendarIcon />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Upcoming Meetings
            </h2>
            <p className="text-xs text-slate-400">
              {meetings.length === 0
                ? "No meetings on the calendar"
                : `${meetings.length} scheduled`}
            </p>
          </div>
        </div>
        <Link
          href="/meetings"
          className="text-xs font-semibold text-violet-400 hover:text-violet-300"
        >
          View all →
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-slate-400">
            Meetings appear here when customers pick a time via response links.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="saas-table w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-saas-border text-slate-400">
                <th className="px-5 py-2.5 text-xs font-semibold">
                  Business
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold">
                  Contact
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold">
                  Date
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold">
                  Time
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold">
                  Status
                </th>
                <th className="px-5 py-2.5 text-xs font-semibold">
                  Countdown
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-saas-border">
              {meetings.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3">
                    <Link
                      href={`/leads/${m.leadId}`}
                      className="font-semibold text-violet-400 hover:text-violet-300"
                    >
                      {m.businessName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <span className="font-medium">{m.contactName}</span>
                    <span className="block text-xs text-slate-400">
                      {m.contactRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatMeetingDate(m.scheduledAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatMeetingTime(m.scheduledAt)}
                  </td>
                  <td className="px-4 py-3">
                    <CRMStatusBadge status={m.crmStatus} />
                  </td>
                  <td className="px-5 py-3">
                    <span className="whitespace-nowrap rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-400">
                      {formatMeetingCountdown(m.scheduledAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );
}
