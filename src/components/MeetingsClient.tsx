"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getScheduledMeetings,
  MEETINGS_UPDATED_EVENT,
  type ScheduledMeeting,
} from "@/lib/meetings";
import { CRM_UPDATED_EVENT, getCrmOverride } from "@/lib/crm-store";
import CRMStatusBadge from "./CRMStatusBadge";
import Button from "./ui/Button";
import type { CRMStatus } from "@/lib/types";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function MeetingsClient() {
  const hasMounted = useHasMounted();
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);

  useEffect(() => {
    if (!hasMounted) return;
    const load = () => {
      const all = getScheduledMeetings().map((m) => ({
        ...m,
        crmStatus: (getCrmOverride(m.leadId) ??
          m.crmStatus) as CRMStatus,
      }));
      setMeetings(all);
    };
    load();
    window.addEventListener(MEETINGS_UPDATED_EVENT, load);
    window.addEventListener(CRM_UPDATED_EVENT, load);
    return () => {
      window.removeEventListener(MEETINGS_UPDATED_EVENT, load);
      window.removeEventListener(CRM_UPDATED_EVENT, load);
    };
  }, [hasMounted]);

  if (!hasMounted) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
          <p className="mt-1 text-slate-500">
            Scheduled via customer response links — synced with CRM automatically
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
        <p className="mt-1 text-slate-500">
          Scheduled via customer response links — synced with CRM automatically
        </p>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="font-medium text-slate-900">No meetings scheduled yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Send outreach with response links, then click &quot;Choose a Meeting
            Time&quot; from the customer page.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Go to leads →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-600">Business</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Contact</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Date / Time</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">CRM</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Score</th>
                <th className="px-4 py-3 font-semibold text-slate-600" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/leads/${m.leadId}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {m.businessName}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-800">{m.contactName}</p>
                    <p className="text-xs text-slate-500">{m.contactRole}</p>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-700">
                    {m.displayTime}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{m.meetingType}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                      {m.autoScheduled !== false || m.scheduledBy === "customer"
                        ? "Auto-scheduled by customer"
                        : "Scheduled"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <CRMStatusBadge status={m.crmStatus} />
                  </td>
                  <td className="px-4 py-4 font-bold text-indigo-600">
                    {m.leadScore}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/leads/${m.leadId}`}>
                      <Button size="sm" variant="secondary">
                        Open Lead
                      </Button>
                    </Link>
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
