"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  fetchSystemStatus,
  type SystemStatus,
} from "@/lib/system-status-client";

const SIMULATED_PROVIDERS = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Connect your Google Workspace or Gmail account",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.98L12 11.09 21.384 3.82h.98A1.636 1.636 0 0 1 24 5.457z" />
        <path fill="#FBBC05" d="M12 11.09L1.636 3.82v15.546h20.728V3.82L12 11.09z" opacity="0" />
      </svg>
    ),
    color: "border-red-100 hover:border-red-200",
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Microsoft 365 and Outlook integration",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24">
        <path fill="#0078D4" d="M24 7.387v9.226c0 .676-.549 1.225-1.225 1.225H1.225A1.225 1.225 0 0 1 0 16.613V7.387c0-.676.549-1.225 1.225-1.225h21.55c.676 0 1.225.549 1.225 1.225z" />
        <path fill="#fff" d="M12 6.5L2 12l10 5.5L22 12 12 6.5z" />
      </svg>
    ),
    color: "border-blue-100 hover:border-blue-200",
  },
  {
    id: "smtp",
    name: "SMTP",
    description: "Custom SMTP server configuration",
    icon: (
      <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    color: "border-saas-border hover:border-slate-300",
  },
];

export default function EmailCenterPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetchSystemStatus().then(setSystemStatus);
  }, []);

  function handleConnect(id: string) {
    setConnecting(id);
    setSuccess(null);
    setTimeout(() => {
      setConnected((prev) => ({ ...prev, [id]: true }));
      setConnecting(null);
      setSuccess(id);
      setTimeout(() => setSuccess(null), 3000);
    }, 1200);
  }

  const anySimulatedConnected = Object.values(connected).some(Boolean);
  const resendReady = systemStatus?.resendReady ?? false;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Email Center</h1>
        <p className="mt-1 text-slate-400">
          Connect your email provider to send outreach from LeadLens AI
        </p>
      </div>

      {systemStatus === null ? (
        <div className="mb-6 rounded-xl border border-saas-border bg-white/5 px-5 py-4">
          <p className="text-sm text-slate-400">Checking Resend configuration…</p>
        </div>
      ) : resendReady ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-7.5" />
          </svg>
          <p className="text-sm font-medium text-emerald-800">Resend connected</p>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm font-medium text-amber-800">Resend not configured</p>
        </div>
      )}

      {anySimulatedConnected && !resendReady && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-saas-border bg-white/5 px-5 py-4">
          <p className="text-sm text-slate-300">
            Simulated provider connected — configure Resend in .env.local for live sending
          </p>
        </div>
      )}

      {/* Resend — live integration */}
      <div
        className={`mb-6 rounded-xl border-2 bg-saas-card p-6 shadow-sm transition-all duration-200 border-slate-800 ${
          resendReady ? "ring-2 ring-emerald-500/30" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#000" />
              <path d="M7 8h10v2H7V8zm0 4h7v2H7v-2z" fill="#fff" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-white">Resend API</h3>
              {systemStatus === null ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-400">
                  Checking…
                </span>
              ) : resendReady ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Resend connected
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  Resend not configured
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Transactional email via Resend — powers the Draft → Approve → Send workflow
            </p>
            {!resendReady && systemStatus !== null && (
              <div className="mt-4 rounded-lg border border-saas-border bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Setup (.env.local)
                </p>
                <pre className="mt-2 overflow-x-auto rounded bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">
{`RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL="LeadLens AI <onboarding@resend.dev>"`}
                </pre>
                <p className="mt-2 text-xs text-slate-400">
                  Restart the dev server after adding keys.{" "}
                  <Link href="/system-status" className="font-medium text-violet-400 hover:underline">
                    View system status →
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Other providers (demo simulation)
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {SIMULATED_PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            className={`rounded-xl border-2 bg-saas-card p-6 shadow-sm transition-all duration-200 ${provider.color} ${
              connected[provider.id] ? "ring-2 ring-emerald-500/30" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5">
                {provider.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{provider.name}</h3>
                  {connected[provider.id] && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Connected
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {provider.description}
                </p>
                {success === provider.id && (
                  <p className="mt-2 text-sm font-semibold text-emerald-600 animate-pulse">
                    ✓ Connected successfully
                  </p>
                )}
                <div className="mt-4">
                  {connected[provider.id] ? (
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
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-500/10 p-6">
        <h2 className="font-semibold text-white">Webhook Automation</h2>
        <p className="mt-1 text-sm text-slate-300">
          How LeadLens knows when customers engage — in production these events
          arrive via webhooks and update CRM automatically.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-saas-border bg-saas-card p-4 shadow-sm">
            <h3 className="text-sm font-bold text-white">Resend Webhooks</h3>
            <p className="mt-1 text-xs text-slate-400">
              Outbound email lifecycle events
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
              <li>
                <span className="font-mono text-xs text-violet-600">email.sent</span>
                {" "}— message accepted by Resend
              </li>
              <li>
                <span className="font-mono text-xs text-violet-600">email.delivered</span>
                {" "}— inbox delivery confirmed
              </li>
              <li>
                <span className="font-mono text-xs text-violet-600">email.opened</span>
                {" "}— customer opened email → CRM stays Contacted
              </li>
              <li>
                <span className="font-mono text-xs text-violet-600">email.clicked</span>
                {" "}— link clicked in email
              </li>
              <li>
                <span className="font-mono text-xs text-violet-600">email.bounced</span>
                {" "}— delivery failed → CRM moves to Lost
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-saas-border bg-saas-card p-4 shadow-sm">
            <h3 className="text-sm font-bold text-white">
              Resend Inbound Webhook
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Customer reply detection
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
              <li>
                <span className="font-mono text-xs text-violet-600">inbound.received</span>
                {" "}— reply parsed from customer inbox
              </li>
              <li className="text-xs text-slate-400">
                Triggers CRM update to{" "}
                <strong>Responded</strong> and logs activity on the lead timeline.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-saas-border bg-saas-card p-4 shadow-sm">
            <h3 className="text-sm font-bold text-white">Calendar Webhook</h3>
            <p className="mt-1 text-xs text-slate-400">
              Meeting invite responses
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
              <li>
                <span className="font-mono text-xs text-violet-600">calendar.accepted</span>
                {" "}— meeting accepted → CRM{" "}
                <strong>Meeting Scheduled</strong>
              </li>
              <li>
                <span className="font-mono text-xs text-violet-600">calendar.declined</span>
                {" "}— meeting declined → CRM <strong>Lost</strong>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-violet-700">
          Demo: simulate these events on any lead detail page via the Event
          Automation Simulator.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-saas-border bg-white/5 p-6">
        <h2 className="font-semibold text-white">Outreach Workflow</h2>
        <p className="mt-1 text-sm text-slate-400">
          Draft → Approve → Send via Resend. Use your own email for demo test sends.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            Go to Leads →
          </Button>
        </Link>
        <p className="mt-4 text-xs text-slate-400">
          Demo safety: emails are only sent when you click Send after approval.
        </p>
      </div>
    </div>
  );
}
