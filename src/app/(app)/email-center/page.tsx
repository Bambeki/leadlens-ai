"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  fetchSystemStatus,
  type SystemStatus,
} from "@/lib/system-status-client";

const WORKFLOW_STEPS = [
  { id: "drafted", label: "Drafted", description: "AI generates personalized outreach" },
  { id: "approved", label: "Approved", description: "Review and approve before sending" },
  { id: "sent", label: "Sent", description: "Email delivered to the customer contact" },
  { id: "opened", label: "Opened", description: "Customer contact opened your message" },
  { id: "replied", label: "Replied", description: "Customer responded and status updated" },
];

const EMAIL_PROVIDERS = [
  {
    id: "resend",
    name: "LeadLens Email",
    description: "Built-in email delivery for outreach campaigns",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Connect your Google Workspace account",
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Microsoft 365 integration",
  },
];

export default function EmailCenterPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetchSystemStatus().then(setSystemStatus);
  }, []);

  function handleConnect(id: string) {
    setConnecting(id);
    setTimeout(() => {
      setConnected((prev) => ({ ...prev, [id]: true }));
      setConnecting(null);
    }, 1200);
  }

  const resendReady = systemStatus?.resendReady ?? false;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Email Center</h1>
        <p className="mt-1 text-slate-400">
          Manage outreach delivery and track engagement across your pipeline
        </p>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-saas-border bg-gradient-to-br from-violet-500/10 via-saas-card to-saas-card p-6">
        <h2 className="text-lg font-semibold text-white">Outreach Workflow</h2>
        <p className="mt-1 text-sm text-slate-400">
          Every email follows a clear opportunity path from draft to reply
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className="rounded-xl border border-saas-border bg-saas-card px-4 py-3">
                <p className="text-sm font-semibold text-white">{step.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{step.description}</p>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {systemStatus === null ? (
        <div className="mb-6 rounded-xl border border-saas-border bg-white/5 px-5 py-4">
          <p className="text-sm text-slate-400">Checking email connection…</p>
        </div>
      ) : resendReady ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-7.5" />
          </svg>
          <p className="text-sm font-medium text-emerald-300">Email delivery connected — ready to send outreach</p>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4">
          <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm font-medium text-amber-300">
            Connect an email provider below to enable live outreach sending
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EMAIL_PROVIDERS.map((provider) => {
          const isResend = provider.id === "resend";
          const isConnected = isResend ? resendReady : connected[provider.id];

          return (
            <div
              key={provider.id}
              className={`rounded-xl border-2 bg-saas-card p-6 shadow-sm transition-all duration-200 border-saas-border ${
                isConnected ? "ring-2 ring-emerald-500/30" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white">{provider.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{provider.description}</p>
                </div>
                {isConnected && (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                    Connected
                  </span>
                )}
              </div>
              <div className="mt-4">
                {isConnected ? (
                  <Button variant="secondary" size="sm" disabled>
                    Connected
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(provider.id)}
                    disabled={connecting === provider.id}
                  >
                    {connecting === provider.id ? "Connecting…" : `Connect ${provider.name}`}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-saas-border bg-white/5 p-6">
        <h2 className="font-semibold text-white">Start Outreach</h2>
        <p className="mt-1 text-sm text-slate-400">
          Open any customer opportunity to draft, approve, and send personalized vehicle branding emails.
        </p>
        <Link href="/pipeline" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            Go to Pipeline →
          </Button>
        </Link>
      </div>
    </div>
  );
}
