"use client";

import { useEffect, useState } from "react";
import {
  CRM_UPDATED_EVENT,
  getActivityTimeline,
  type ActivityEvent,
} from "@/lib/crm-store";
import { useHasMounted } from "@/hooks/useHasMounted";

const TYPE_STYLES: Record<string, { dot: string; icon: string }> = {
  email_drafted: { dot: "bg-slate-400", icon: "✎" },
  email_approved: { dot: "bg-amber-500", icon: "✓" },
  email_sent: { dot: "bg-blue-500", icon: "✉" },
  crm_contacted: { dot: "bg-violet-500/150", icon: "◎" },
  email_opened: { dot: "bg-violet-500", icon: "◉" },
  email_replied: { dot: "bg-emerald-500", icon: "↩" },
  crm_responded: { dot: "bg-violet-600", icon: "◎" },
  meeting_scheduled: { dot: "bg-amber-600", icon: "📅" },
  meeting_accepted: { dot: "bg-emerald-500", icon: "✓" },
  meeting_declined: { dot: "bg-red-500", icon: "✕" },
  email_bounced: { dot: "bg-red-600", icon: "!" },
  crm_meeting_scheduled: { dot: "bg-amber-600", icon: "◎" },
  crm_lost: { dot: "bg-red-600", icon: "◎" },
  crm_manual_update: { dot: "bg-slate-500", icon: "◎" },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityTimeline({ leadId }: { leadId: string }) {
  const hasMounted = useHasMounted();
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (!hasMounted) return;
    const load = () => setEvents(getActivityTimeline(leadId));
    load();
    window.addEventListener(CRM_UPDATED_EVENT, load);
    return () => window.removeEventListener(CRM_UPDATED_EVENT, load);
  }, [leadId, hasMounted]);

  if (!hasMounted) {
    return (
      <div className="saas-card p-6">
        <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
        <p className="mt-1 text-sm text-slate-400">
          Outreach and CRM events for this lead
        </p>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-4">
              <div className="h-6 w-6 animate-pulse rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card p-6">
      <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
      <p className="mt-1 text-sm text-slate-400">
        Outreach and CRM events for this lead
      </p>

      {events.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          No activity yet — generate and send outreach to start the timeline.
        </p>
      ) : (
        <ol className="mt-6 space-y-0">
          {events.map((event, i) => {
            const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.crm_manual_update;
            const isLast = i === events.length - 1;
            return (
              <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast && (
                  <span className="absolute left-[11px] top-6 h-full w-px bg-slate-200" />
                )}
                <span
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] text-white ${style.dot}`}
                >
                  {style.icon}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-white">
                    {event.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatTime(event.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
