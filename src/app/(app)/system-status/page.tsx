"use client";

import { useEffect, useState } from "react";
import {
  fetchSystemStatus,
  type SystemStatus,
} from "@/lib/system-status-client";

function StatusCard({
  label,
  ok,
  description,
  statusLabel,
}: {
  label: string;
  ok: boolean;
  description?: string;
  statusLabel?: string;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-5 shadow-sm transition-colors ${
        ok
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-red-500/30 bg-red-500/10"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">{label}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
            ok
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {statusLabel ?? (ok ? "Detected" : "Missing")}
        </span>
      </div>
      {description && (
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      )}
    </div>
  );
}

export default function SystemStatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStatus().then((s) => {
      setStatus(s);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">System Status</h1>
        <p className="mt-1 text-slate-400">
          Production integration checks for database, AI, email, and prototype services
          (no secrets shown)
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">Checking server environment…</p>
      )}

      {status && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Database
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatusCard
                label="DATABASE_URL"
                ok={status.databaseUrlDetected}
                description="Server-side PostgreSQL connection variable"
              />
              <StatusCard
                label="Database Connection"
                ok={status.databaseConnected === true}
                statusLabel={
                  status.databaseConnected === null
                    ? "Not checked"
                    : status.databaseConnected
                      ? "Connected"
                      : "Error"
                }
                description={
                  status.databaseConnected
                    ? "Prisma can connect to PostgreSQL"
                    : status.databaseError ?? "Prisma could not confirm database connectivity"
                }
              />
              <StatusCard
                label="DIRECT_URL"
                ok={status.directUrlDetected}
                description="Optional Prisma migration/direct connection variable"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              AI
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatusCard
                label="OpenAI API Key"
                ok={status.openAiApiKeyDetected}
                description="OPENAI_API_KEY is checked only on the server"
              />
              <StatusCard
                label="OpenAI Model"
                ok={status.openAiReady}
                statusLabel={status.openAiModel}
                description="Configured via OPENAI_MODEL, defaulting to gpt-4o-mini"
              />
              <StatusCard
                label="AI Generation"
                ok={status.openAiReady}
                statusLabel={status.openAiReady ? "Configured" : "Not configured"}
                description="Fallback generation remains available when OpenAI is unavailable"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Email
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatusCard
                label="Resend API Key"
                ok={status.resendApiKeyDetected}
                description="RESEND_API_KEY is checked only on the server"
              />
              <StatusCard
                label="Resend From Email"
                ok={status.resendFromEmailDetected}
                description="RESEND_FROM_EMAIL is required for live sending"
              />
              <StatusCard
                label="Resend Ready"
                ok={status.resendReady}
                statusLabel={status.resendReady ? "Configured" : "Not configured"}
                description="Both API key and from-email are set"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Meetings
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatusCard
                label="Meeting Provider"
                ok={status.meetingProviderConfigured}
                statusLabel={
                  status.meetingProviderConfigured ? "Configured" : "Not configured"
                }
                description="No Google Meet, Teams, Zoom, Calendly, or calendar provider is currently integrated"
              />
              <StatusCard
                label="Prototype Response Links"
                ok
                statusLabel="Available"
                description="Customers can choose predefined times through LeadLens response pages"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Apify
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatusCard
                label="Apify Token"
                ok={status.apifyTokenDetected}
                description="APIFY_TOKEN in .env.local"
              />
              <StatusCard
                label="Apify Actor ID"
                ok={status.apifyActorDetected}
                description="APIFY_GOOGLE_MAPS_ACTOR in .env.local"
              />
              <StatusCard
                label="Apify Ready"
                ok={status.apifyReady}
                description="Both token and actor ID are set"
              />
            </div>
          </section>

          <div className="rounded-xl border border-saas-border bg-white/5 p-5 text-sm text-slate-300">
            <p className="font-medium text-slate-300">Troubleshooting</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Configure production variables in Vercel and local variables in{" "}
                <code className="text-xs">.env.local</code>
              </li>
              <li>
                Quote values with spaces:{" "}
                <code className="text-xs">
                  RESEND_FROM_EMAIL=&quot;LeadLens AI &lt;onboarding@resend.dev&gt;&quot;
                </code>
              </li>
              <li>Restart <code className="text-xs">npm run dev</code> after changing env files</li>
              <li>
                Check the terminal for{" "}
                <code className="text-xs">DATABASE_URL detected: true/false</code>{" "}
                and provider detection logs on server start
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
