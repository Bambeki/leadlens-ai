"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getScheduledMeetingsFromDb,
  MEETINGS_UPDATED_EVENT,
  type ScheduledMeeting,
} from "@/lib/meetings";
import { CRM_UPDATED_EVENT } from "@/lib/crm-store";
import CRMStatusBadge from "./CRMStatusBadge";
import Button from "./ui/Button";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function MeetingsClient() {
  const hasMounted = useHasMounted();
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasMounted) return;
    let isCurrent = true;
    let loadQueue = Promise.resolve();

    const load = async () => {
      try {
        const all = await getScheduledMeetingsFromDb();
        if (!isCurrent) return;
        setMeetings(all);
        setLoadError(null);
      } catch {
        if (!isCurrent) return;
        setLoadError("Could not load meetings from the database.");
      }
    };
    const queueLoad = () => {
      loadQueue = loadQueue.catch(() => {}).then(load).catch(() => {});
    };

    queueLoad();
    window.addEventListener(MEETINGS_UPDATED_EVENT, queueLoad);
    window.addEventListener(CRM_UPDATED_EVENT, queueLoad);
    return () => {
      isCurrent = false;
      window.removeEventListener(MEETINGS_UPDATED_EVENT, queueLoad);
      window.removeEventListener(CRM_UPDATED_EVENT, queueLoad);
    };
  }, [hasMounted]);

  if (!hasMounted) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Meetings</h1>
          <p className="mt-1 text-slate-400">
            Scheduled via customer response links and synced with opportunity status
          </p>
        </div>
        <div className="rounded-xl border border-saas-border bg-saas-card p-8">
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 animate-pulse rounded-lg bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Meetings</h1>
        <p className="mt-1 text-slate-400">
          Scheduled via customer response links and synced with opportunity status
        </p>
        {loadError && (
          <p className="mt-2 text-sm font-medium text-red-400">{loadError}</p>
        )}
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-saas-border bg-saas-card py-16 text-center">
          <p className="font-medium text-white">No meetings scheduled yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Send outreach with response links, then click &quot;Choose a Meeting
            Time&quot; from the customer page.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-violet-400 hover:text-violet-300"
          >
            Go to opportunities →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-saas-border bg-saas-card shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-saas-border bg-white/5">
                <th className="px-4 py-3 font-semibold text-slate-300">Business</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Contact</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Date / Time</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Type</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Opportunity Status</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Score</th>
                <th className="px-4 py-3 font-semibold text-slate-300" />
              </tr>
            </thead>
            <tbody className="divide-y divide-saas-border">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-white/5">
                  <td className="px-4 py-4">
                    <Link
                      href={`/leads/${m.leadId}`}
                      className="font-semibold text-violet-400 hover:text-violet-300"
                    >
                      {m.businessName}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-300">{m.contactName}</p>
                    <p className="text-xs text-slate-400">{m.contactRole}</p>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-300">
                    {m.displayTime}
                  </td>
                  <td className="px-4 py-4 text-slate-300">{m.meetingType}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                      {m.autoScheduled !== false || m.scheduledBy === "customer"
                        ? "Auto-scheduled by customer"
                        : "Scheduled"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <CRMStatusBadge status={m.crmStatus} />
                  </td>
                  <td className="px-4 py-4 font-bold text-violet-400">
                    {m.leadScore}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/leads/${m.leadId}`}>
                      <Button size="sm" variant="secondary">
                        Open Opportunity
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
