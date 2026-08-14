"use client";

import { useEffect, useState } from "react";
import type { Lead } from "@/lib/types";
import {
  CRM_UPDATED_EVENT,
  hasOutreachBeenSent,
  getOutreachStatusFromDb,
  type OutreachStatus,
} from "@/lib/crm-store";
import {
  DEMO_SIMULATION_ENABLED,
  simulateWebhookEvent,
  type WebhookEvent,
} from "@/lib/event-automation";
import Button from "./ui/Button";

const EVENTS: {
  id: WebhookEvent;
  label: string;
  description: string;
  webhook: string;
  variant?: "primary" | "secondary" | "success" | "danger";
}[] = [
  {
    id: "email_opened",
    label: "Simulate Email Opened",
    description: "Demo event: email.opened",
    webhook: "simulated.email.opened",
    variant: "secondary",
  },
  {
    id: "customer_replied",
    label: "Simulate Customer Replied",
    description: "Demo event: customer replied",
    webhook: "simulated.inbound.received",
    variant: "primary",
  },
  {
    id: "meeting_accepted",
    label: "Simulate Meeting Accepted",
    description: "Demo event: invite accepted",
    webhook: "simulated.calendar.accepted",
    variant: "success",
  },
  {
    id: "meeting_declined",
    label: "Simulate Meeting Declined",
    description: "Demo event: invite declined",
    webhook: "simulated.calendar.declined",
    variant: "danger",
  },
  {
    id: "email_bounced",
    label: "Simulate Email Bounced",
    description: "Demo event: email bounced",
    webhook: "simulated.email.bounced",
    variant: "danger",
  },
];

export default function EventAutomationSimulator({ lead }: { lead: Lead }) {
  const [canSimulate, setCanSimulate] = useState(false);
  const [outreachStatus, setOutreachStatus] = useState<OutreachStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let refreshQueue = Promise.resolve();

    async function refresh() {
      const status = await getOutreachStatusFromDb(lead.id);
      if (!isCurrent) return;
      setCanSimulate(hasOutreachBeenSent(lead.id));
      setOutreachStatus(status);
    }
    const queueRefresh = () => {
      refreshQueue = refreshQueue.catch(() => {}).then(refresh).catch(() => {});
    };

    queueRefresh();
    window.addEventListener(CRM_UPDATED_EVENT, queueRefresh);
    return () => {
      isCurrent = false;
      window.removeEventListener(CRM_UPDATED_EVENT, queueRefresh);
    };
  }, [lead.id]);

  if (!DEMO_SIMULATION_ENABLED) {
    return null;
  }

  async function handleSimulate(event: WebhookEvent) {
    setError(null);
    try {
      const result = await simulateWebhookEvent(lead, event);
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      setLastEvent(event);
      setOutreachStatus(await getOutreachStatusFromDb(lead.id));
    } catch {
      setError("Could not save the simulated event to the database.");
    }
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Demo / Developer Simulation
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            Manually trigger simulated events for local testing. These are not real customer actions.
          </p>
        </div>
        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
          Simulation only
        </span>
      </div>

      {outreachStatus && (
        <p className="mt-3 text-xs text-slate-400">
          Outreach status:{" "}
          <span className="font-semibold text-violet-400">{outreachStatus}</span>
        </p>
      )}

      {!canSimulate && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Send an outreach email first. These buttons create simulated events for local testing.
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {EVENTS.map((ev) => (
          <div
            key={ev.id}
            className="rounded-lg border border-white/80 bg-saas-card/90 p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-white">{ev.label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{ev.description}</p>
            <p className="mt-1 font-mono text-[10px] text-violet-600">
              {ev.webhook}
            </p>
            <div className="mt-3">
              <Button
                size="sm"
                variant={ev.variant ?? "secondary"}
                onClick={() => handleSimulate(ev.id)}
                disabled={!canSimulate}
              >
                {ev.label}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300">
          {error}
        </p>
      )}

      {lastEvent && !error && (
        <p className="mt-4 text-sm font-medium text-emerald-400">
          ✓ Simulated event processed — opportunity status and timeline updated.
        </p>
      )}
    </div>
  );
}
