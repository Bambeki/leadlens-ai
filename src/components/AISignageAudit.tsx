import type { SignageAudit } from "@/lib/types";
import { formatCurrency } from "@/lib/scoring";

function ScoreGauge({
  score,
  label,
  size = "lg",
}: {
  score: number;
  label: string;
  size?: "lg" | "sm";
}) {
  const color =
    score <= 35 ? "#ef4444" : score <= 55 ? "#f59e0b" : "#10b981";
  const dim = size === "lg" ? "h-36 w-36" : "h-20 w-20";
  const textSize = size === "lg" ? "text-4xl" : "text-lg";

  return (
    <div className="flex flex-col items-center">
      <div className={`relative flex ${dim} items-center justify-center`}>
        <svg className={`${dim} -rotate-90`} viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2.5"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <span className={`font-bold text-white ${textSize}`}>{score}</span>
          {size === "lg" && (
            <p className="text-xs text-indigo-300">/ 100</p>
          )}
        </div>
      </div>
      <p className={`mt-2 font-medium text-indigo-200 ${size === "lg" ? "text-sm" : "text-xs"}`}>
        {label}
      </p>
    </div>
  );
}

function AssessmentBar({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
}) {
  const barColor =
    score <= 35
      ? "bg-red-500"
      : score <= 55
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-indigo-200">
            {icon}
          </div>
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{score}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-indigo-300/70">
        {score <= 35
          ? "Critical — immediate upgrade needed"
          : score <= 55
            ? "Below average — opportunity detected"
            : "Adequate — enhancement possible"}
      </p>
    </div>
  );
}

export default function AISignageAudit({ audit }: { audit: SignageAudit }) {
  const opportunityLevel =
    audit.visibilityScore <= 35
      ? { label: "HIGH OPPORTUNITY", color: "bg-red-500/20 text-red-300 ring-red-500/30" }
      : audit.visibilityScore <= 55
        ? { label: "MEDIUM OPPORTUNITY", color: "bg-amber-500/20 text-amber-300 ring-amber-500/30" }
        : { label: "LOW OPPORTUNITY", color: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30" };

  return (
    <div className="overflow-hidden rounded-2xl border border-saas-border shadow-xl">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-6 py-8 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-200 ring-1 ring-violet-400/30">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                VEHICLE BRANDING AUDIT
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${opportunityLevel.color}`}>
                {opportunityLevel.label}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">
              Vehicle Branding Intelligence
            </h2>
            <p className="mt-1 max-w-lg text-sm text-violet-300">
              {audit.verdict}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <ScoreGauge score={audit.visibilityScore} label="Fleet Visibility Score" />
            <div className="hidden sm:block">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2.5"
                    strokeDasharray={`${audit.confidenceScore}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-bold text-white">
                    {audit.confidenceScore}%
                  </span>
                  <p className="text-[10px] text-violet-300">AI Confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branding Assessment */}
      <div className="border-b border-saas-border bg-gradient-to-r from-violet-950/80 to-saas-bg px-6 py-6 sm:px-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-violet-300">
          Fleet Branding Assessment
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <AssessmentBar
            label="Wrap Quality"
            score={audit.brandingAssessment.signQuality}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              </svg>
            }
          />
          <AssessmentBar
            label="Fleet Visibility"
            score={audit.brandingAssessment.visibility}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            }
          />
          <AssessmentBar
            label="Graphics Consistency"
            score={audit.brandingAssessment.brandingConsistency}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            }
          />
          <AssessmentBar
            label="Mobile Brand Impact"
            score={audit.brandingAssessment.vehicleBranding}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Weaknesses & Recommendations */}
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-b border-saas-border bg-saas-card p-6 lg:border-b-0 lg:border-r">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-red-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/15">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </span>
            Fleet Weakness Detection
          </h3>
          <ul className="mt-4 space-y-2">
            {audit.weaknesses.map((w) => (
              <li
                key={w}
                className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
              >
                <span className="flex h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                <span className="text-sm font-medium text-red-300">{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-saas-card p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
            AI Recommendations
          </h3>
          <ul className="mt-4 space-y-2">
            {audit.recommendations.map((r) => (
              <li
                key={r}
                className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  ✓
                </span>
                <span className="text-sm font-medium text-emerald-300">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Revenue & Confidence footer */}
      <div className="grid gap-0 border-t border-saas-border bg-saas-card sm:grid-cols-3">
        <div className="border-b border-saas-border p-6 sm:border-b-0 sm:border-r">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Minimum Value
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatCurrency(audit.estimatedValue.min)}
          </p>
        </div>
        <div className="border-b border-saas-border p-6 sm:border-b-0 sm:border-r">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Maximum Value
          </p>
          <p className="mt-1 text-2xl font-bold text-violet-400">
            {formatCurrency(audit.estimatedValue.max)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            AI Confidence Score
          </p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-bold text-white">
              {audit.confidenceScore}%
            </p>
            <p className="mb-1 text-sm text-slate-400">audit accuracy</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
              style={{ width: `${audit.confidenceScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
