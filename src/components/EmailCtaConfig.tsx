"use client";

import {
  EMAIL_CTA_DEFINITIONS,
  type EmailCtaConfig,
  type EmailCtaId,
} from "@/lib/email-template";

interface EmailCtaConfigProps {
  config: EmailCtaConfig;
  onChange: (config: EmailCtaConfig) => void;
  disabled?: boolean;
}

const VARIANT_STYLES: Record<
  "primary" | "secondary" | "tertiary",
  string
> = {
  primary: "bg-violet-600 text-white ring-indigo-600",
  secondary: "bg-violet-500/15 text-violet-400 ring-indigo-300",
  tertiary: "bg-saas-card text-violet-400 ring-indigo-200",
};

export default function EmailCtaConfigPanel({
  config,
  onChange,
  disabled = false,
}: EmailCtaConfigProps) {
  function toggle(id: EmailCtaId) {
    if (disabled) return;
    onChange({ ...config, [id]: !config[id] });
  }

  return (
    <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
        Email CTA Buttons
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Choose which action buttons appear in the HTML email
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {EMAIL_CTA_DEFINITIONS.map((cta) => {
          const enabled = config[cta.id];
          return (
            <label
              key={cta.id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                enabled
                  ? "border-violet-500/20 bg-saas-card"
                  : "border-saas-border bg-white/5 opacity-70"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggle(cta.id)}
                  disabled={disabled}
                  className="rounded border-slate-300 text-violet-400 focus:ring-violet-500"
                />
                <span
                  className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ring-1 ring-inset ${VARIANT_STYLES[cta.variant]}`}
                >
                  {cta.label}
                </span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {cta.variant}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
