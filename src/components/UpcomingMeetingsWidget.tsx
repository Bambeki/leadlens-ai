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
      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="px-5 py-8">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <CalendarIcon />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Upcoming Meetings
            </h2>
            <p className="text-xs text-slate-500">
              {meetings.length === 0
                ? "No meetings on the calendar"
                : `${meetings.length} scheduled`}
            </p>
          </div>
        </div>
        <Link
          href="/meetings"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View all →
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-slate-500">
            Meetings appear here when customers pick a time via response links.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                  Business
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">
                  Contact
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">
                  Date
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">
                  Time
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">
                  Status
                </th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                  Countdown
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <Link
                      href={`/leads/${m.leadId}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {m.businessName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <span className="font-medium">{m.contactName}</span>
                    <span className="block text-xs text-slate-400">
                      {m.contactRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatMeetingDate(m.scheduledAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatMeetingTime(m.scheduledAt)}
                  </td>
                  <td className="px-4 py-3">
                    <CRMStatusBadge status={m.crmStatus} />
                  </td>
                  <td className="px-5 py-3">
                    <span className="whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
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
