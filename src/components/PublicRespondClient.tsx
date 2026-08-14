"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMeetingSlotOptions, type MeetingSlot } from "@/lib/customer-response";
import type { PublicCustomerAction } from "@/lib/types";
import Button from "./ui/Button";

interface PublicContext {
  businessName: string;
  contactName: string;
  alreadyOptedOut: boolean;
  allowedActions: PublicCustomerAction[];
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
      <div className="w-full max-w-md rounded-2xl border border-saas-border bg-saas-card p-8 text-center shadow-lg">
        {children}
      </div>
    </div>
  );
}

export default function PublicRespondClient({
  token,
  action,
  slotId,
}: {
  token: string;
  action?: string;
  slotId?: string;
}) {
  const [context, setContext] = useState<PublicContext | null>(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<PublicCustomerAction | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<MeetingSlot[]>([]);

  useEffect(() => {
    let isCurrent = true;
    fetch(`/api/public/response/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!isCurrent) return;
        if (!res.ok || !data.response) {
          setMissing(true);
          setReady(true);
          return;
        }
        setContext(data.response as PublicContext);
        if (action === "schedule" && !slotId) {
          setSlots(getMeetingSlotOptions());
        }
        setReady(true);
      })
      .catch(() => {
        if (!isCurrent) return;
        setMissing(true);
        setReady(true);
      });
    return () => {
      isCurrent = false;
    };
  }, [token, action, slotId]);

  async function submit(nextAction: PublicCustomerAction, nextSlotId?: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/response/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction, slotId: nextSlotId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "We could not save your response. Please try again."
        );
        return;
      }
      if (data.response) setContext(data.response as PublicContext);
      if (typeof data.confirmedSlot === "string") setConfirmedSlot(data.confirmedSlot);
      setCompleted(nextAction);
    } catch {
      setError("We could not save your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <Shell>
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-500/20 border-t-indigo-600" />
        <p className="mt-4 text-sm font-medium text-slate-300">Loading...</p>
      </Shell>
    );
  }

  if (missing || !context) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-white">Link not available</h1>
        <p className="mt-2 text-sm text-slate-400">
          This response link is invalid or no longer available.
        </p>
      </Shell>
    );
  }

  if (completed === "not_interested" || context.alreadyOptedOut) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-white">
          Thank you. You will not receive further outreach regarding this
          opportunity.
        </h1>
      </Shell>
    );
  }

  if (completed === "interested") {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-white">Thanks for your response</h1>
        <p className="mt-3 text-slate-300">
          We received your interest, {context.contactName}. The LeadLens AI team
          will follow up with {context.businessName} shortly.
        </p>
      </Shell>
    );
  }

  if (completed === "schedule" && confirmedSlot) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-white">Meeting confirmed</h1>
        <p className="mt-3 text-slate-300">
          Thanks, {context.contactName}. Your meeting is scheduled for{" "}
          <strong>{confirmedSlot}</strong>.
        </p>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-white">Response not saved</h1>
        <p className="mt-3 text-slate-300">{error}</p>
        <Link href={`/r/${token}`} className="mt-5 inline-block">
          <Button>Try again</Button>
        </Link>
      </Shell>
    );
  }

  if (action === "not_interested" || action === "declined") {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
          LeadLens AI
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Not interested?</h1>
        <p className="mt-3 text-slate-300">
          Confirm below and we will stop outreach about this opportunity for{" "}
          {context.businessName}.
        </p>
        <div className="mt-6 space-y-3">
          <Button
            className="w-full"
            disabled={submitting}
            onClick={() => submit("not_interested")}
          >
            {submitting ? "Saving..." : "Confirm not interested"}
          </Button>
          <Link href={`/r/${token}`} className="block">
            <Button variant="ghost" className="w-full">
              Go back
            </Button>
          </Link>
        </div>
      </Shell>
    );
  }

  if (action === "schedule") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-saas-bg p-6">
        <div className="w-full max-w-lg rounded-2xl border border-saas-border bg-saas-card p-8 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            LeadLens AI
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Choose a meeting time</h1>
          <p className="mt-2 text-slate-300">
            Hi {context.contactName} — pick a time that works for{" "}
            <span className="font-semibold">{context.businessName}</span>.
          </p>
          <div className="mt-6 space-y-3">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                disabled={submitting}
                onClick={() => submit("schedule", slot.id)}
                className="flex w-full items-center justify-between rounded-xl border border-saas-border bg-white/5 px-5 py-4 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/15"
              >
                <span className="font-semibold text-white">{slot.label}</span>
                <span className="text-sm text-violet-400">Select →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (action === "interested") {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
          LeadLens AI
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Request a call?</h1>
        <p className="mt-3 text-slate-300">
          Confirm and the LeadLens AI team will follow up with {context.businessName}.
        </p>
        <div className="mt-6 space-y-3">
          <Button
            className="w-full"
            disabled={submitting}
            onClick={() => submit("interested")}
          >
            {submitting ? "Saving..." : "Confirm interest"}
          </Button>
          <Link href={`/r/${token}`} className="block">
            <Button variant="ghost" className="w-full">
              Go back
            </Button>
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
        LeadLens AI × {context.businessName}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-white">Thanks for your response</h1>
      <p className="mt-3 text-slate-300">
        Hi {context.contactName}, how would you like to proceed?
      </p>
      <div className="mt-6 space-y-3 text-left">
        <Link href={`/r/${token}?action=interested`}>
          <Button className="w-full">Request a Call</Button>
        </Link>
        <Link href={`/r/${token}?action=schedule`}>
          <Button variant="secondary" className="w-full">
            Choose a Meeting Time
          </Button>
        </Link>
        <Link href={`/r/${token}?action=not_interested`}>
          <Button variant="ghost" className="w-full">
            Not Interested
          </Button>
        </Link>
      </div>
    </Shell>
  );
}
