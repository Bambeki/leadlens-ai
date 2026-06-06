"use client";

import { buildHtmlEmail, type EmailCtaConfig } from "@/lib/email-template";

interface EmailPreviewProps {
  subject: string;
  body: string;
  leadId: string;
  ctaConfig: EmailCtaConfig;
  baseUrl?: string;
}

export default function EmailPreview({
  subject,
  body,
  leadId,
  ctaConfig,
  baseUrl,
}: EmailPreviewProps) {
  const html = buildHtmlEmail({
    headline: subject.trim() || "Email preview",
    body,
    leadId,
    baseUrl,
    ctaConfig,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email Preview
          </span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            HTML
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span>Gmail</span>
          <span>·</span>
          <span>Outlook</span>
          <span>·</span>
          <span>Apple Mail</span>
        </div>
      </div>
      <div className="max-h-[520px] overflow-y-auto p-4">
        <iframe
          title="Email preview"
          srcDoc={html}
          className="h-[480px] w-full rounded-lg border border-slate-200 bg-white shadow-sm"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
