"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";
import { toAbsoluteResponseUrl } from "@/lib/customer-response";
import { useHasMounted } from "@/hooks/useHasMounted";
import Button from "./ui/Button";

export default function CustomerResponsePanel({ lead }: { lead: Lead }) {
  const hasMounted = useHasMounted();
  const [copied, setCopied] = useState<string | null>(null);

  const links = [
    {
      label: "Interested / Request a Call",
      path: `/respond/${lead.id}?action=interested`,
    },
    {
      label: "Choose Meeting Time",
      path: `/respond/${lead.id}?action=schedule`,
    },
    {
      label: "Not Interested",
      path: `/respond/${lead.id}?action=declined`,
    },
  ];

  const hubPath = `/respond/${lead.id}`;

  function copyUrl(path: string, label: string) {
    navigator.clipboard.writeText(toAbsoluteResponseUrl(path));
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!hasMounted) {
    return (
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Customer Response Links
        </h3>
        <p className="mt-1 text-sm text-slate-500">Loading response links...</p>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-16 animate-pulse rounded-lg bg-white/60"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Customer Response Links
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Share these links in demo emails — judges click them to update CRM
        automatically (no manual simulation needed).
      </p>

      <div className="mt-4 space-y-2">
        {links.map((link) => (
          <div
            key={link.label}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white bg-white/80 px-4 py-3"
          >
            <div className="min-w-0">
              <span className="text-sm font-medium text-slate-800">
                {link.label}
              </span>
              <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                {link.path}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copyUrl(link.path, link.label)}
              >
                {copied === link.label ? "Copied!" : "Copy Link"}
              </Button>
              <a href={link.path} target="_blank" rel="noopener noreferrer">
                <Button size="sm">Open</Button>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a href={hubPath} target="_blank" rel="noopener noreferrer">
          <Button>Open customer response link</Button>
        </a>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Copy Link includes the full URL for email sharing. Open uses relative
        paths — same as links embedded in outreach emails.
      </p>
    </div>
  );
}
