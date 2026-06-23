"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/types";
import { findLeadById } from "@/lib/lead-lookup";
import {
  getMeetingSlotOptions,
  processCustomerInterested,
  processCustomerDeclined,
  processCustomerMeetingScheduled,
  type MeetingSlot,
} from "@/lib/customer-response";
import { useHasMounted } from "@/hooks/useHasMounted";
import Button from "./ui/Button";

function ProcessingView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
      <div className="max-w-md rounded-2xl border border-saas-border bg-saas-card p-8 text-center shadow-lg">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-500/20 border-t-indigo-600" />
        <p className="mt-4 text-sm font-medium text-slate-300">
          Processing customer response...
        </p>
      </div>
    </div>
  );
}

function HubLoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
      <div className="max-w-md rounded-2xl border border-saas-border bg-saas-card p-8 text-center shadow-lg">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="mx-auto mt-4 h-6 w-64 animate-pulse rounded bg-white/10" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-10 animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SchedulePickerSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
      <div className="w-full max-w-lg rounded-2xl border border-saas-border bg-saas-card p-8 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
          LeadLens AI
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          Choose a meeting time
        </h1>
        <p className="mt-2 text-sm text-slate-400">Loading available times...</p>
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-14 animate-pulse rounded-xl bg-white/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RespondClient({
  leadId,
  action,
  slotId,
}: {
  leadId: string;
  action?: string;
  slotId?: string;
}) {
  const hasMounted = useHasMounted();
  const [lead, setLead] = useState<Lead | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<MeetingSlot[]>([]);
  const appliedRef = useRef<string | null>(null);

  const hasAction =
    action === "interested" ||
    action === "declined" ||
    (action === "schedule" && Boolean(slotId));

  useEffect(() => {
    if (!hasMounted) return;

    const timeout = window.setTimeout(() => {
      const found = findLeadById(leadId);
      setLead(found);

      if (!found) {
        setReady(true);
        return;
      }

      if (action === "schedule" && !slotId) {
        setSlots(getMeetingSlotOptions());
        setReady(true);
        return;
      }

      if (!hasAction) {
        setReady(true);
        return;
      }

      const key = `${action ?? ""}-${slotId ?? ""}`;
      if (appliedRef.current === key) {
        setReady(true);
        return;
      }

      if (action === "interested") {
        processCustomerInterested(found);
        appliedRef.current = key;
        setProcessed(true);
        setReady(true);
        return;
      }

      if (action === "declined") {
        processCustomerDeclined(found);
        appliedRef.current = key;
        setProcessed(true);
        setReady(true);
        return;
      }

      if (action === "schedule" && slotId) {
        const slot = getMeetingSlotOptions().find((s) => s.id === slotId);
        if (slot) {
          processCustomerMeetingScheduled(found, slot);
          appliedRef.current = key;
          setProcessed(true);
          setConfirmedSlot(slot.label);
        }
        setReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [hasMounted, leadId, action, slotId, hasAction]);

  if (!hasMounted || !ready) {
    if (action === "schedule" && !slotId) {
      return <SchedulePickerSkeleton />;
    }
    if (hasAction) {
      return <ProcessingView />;
    }
    return <HubLoadingSkeleton />;
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white/5 p-6">
        <div className="max-w-md rounded-2xl border border-saas-border bg-saas-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-white">Link not found</h1>
          <p className="mt-2 text-sm text-slate-400">
            This response link is invalid or the lead no longer exists.
          </p>
        </div>
      </div>
    );
  }

  if (action === "schedule" && !slotId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
        <div className="w-full max-w-lg rounded-2xl border border-saas-border bg-saas-card p-8 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            LeadLens AI
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Choose a meeting time
          </h1>
          <p className="mt-2 text-slate-300">
            Hi {lead.contact.name} — pick a time that works for{" "}
            <span className="font-semibold">{lead.businessName}</span>.
          </p>
          <div className="mt-6 space-y-3">
            {slots.map((slot) => (
              <Link
                key={slot.id}
                href={`/respond/${leadId}?action=schedule&slot=${slot.id}`}
                className="flex w-full items-center justify-between rounded-xl border border-saas-border bg-white/5 px-5 py-4 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/15"
              >
                <span className="font-semibold text-white">{slot.label}</span>
                <span className="text-sm text-violet-400">Select →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (processed && action === "schedule" && confirmedSlot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
        <div className="max-w-md rounded-2xl border border-emerald-500/30 bg-saas-card p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
            <svg
              className="h-7 w-7 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-7.5"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Meeting confirmed
          </h1>
          <p className="mt-2 text-slate-300">
            Thanks, {lead.contact.name}! Your meeting with LeadLens AI is
            scheduled for <strong>{confirmedSlot}</strong>.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            A calendar invite will be sent to your email. Opportunity status
            is updated automatically in LeadLens AI.
          </p>
        </div>
      </div>
    );
  }

  if (processed && action === "interested") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
        <div className="max-w-md rounded-2xl border border-emerald-500/30 bg-saas-card p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-white">
            Thanks for your response!
          </h1>
          <p className="mt-3 text-slate-300">
            We received your interest, {lead.contact.name}. The{" "}
            <strong>LeadLens AI</strong> team will reach out to{" "}
            <strong>{lead.businessName}</strong> shortly.
          </p>
          <p className="mt-4 text-sm font-medium text-emerald-400">
            ✓ Your response updated the opportunity automatically.
          </p>
        </div>
      </div>
    );
  }

  if (processed && action === "declined") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white/5 p-6">
        <div className="max-w-md rounded-2xl border border-saas-border bg-saas-card p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-white">
            Thanks for your response
          </h1>
          <p className="mt-3 text-slate-300">
            No problem — we&apos;ve noted your preference for{" "}
            {lead.businessName}. You won&apos;t receive further outreach about
            this offer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
      <div className="max-w-md rounded-2xl border border-saas-border bg-saas-card p-8 text-center shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
          LeadLens AI × {lead.businessName}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          Thanks for your response
        </h1>
        <p className="mt-3 text-slate-300">
          Hi {lead.contact.name}, how would you like to proceed?
        </p>
        <div className="mt-6 space-y-3 text-left">
          <Link href={`/respond/${leadId}?action=interested`}>
            <Button className="w-full">Request a Call</Button>
          </Link>
          <Link href={`/respond/${leadId}?action=schedule`}>
            <Button variant="secondary" className="w-full">
              Choose a Meeting Time
            </Button>
          </Link>
          <Link href={`/respond/${leadId}?action=declined`}>
            <Button variant="ghost" className="w-full">
              Not Interested
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
