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
}: {
  label: string;
  ok: boolean;
  description?: string;
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
          {ok ? "Detected" : "Missing"}
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
          Environment variable detection for Resend and Apify (no secrets shown)
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">Checking server environment…</p>
      )}

      {status && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Resend
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatusCard
                label="Resend API Key"
                ok={status.resendApiKeyDetected}
                description="RESEND_API_KEY in .env.local"
              />
              <StatusCard
                label="Resend From Email"
                ok={status.resendFromEmailDetected}
                description="RESEND_FROM_EMAIL in .env.local"
              />
              <StatusCard
                label="Resend Ready"
                ok={status.resendReady}
                description="Both API key and from-email are set"
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
                Place variables in <code className="text-xs">.env.local</code> at
                the project root
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
                <code className="text-xs">RESEND detected: true/false</code> on
                server start
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
