import type { PipelineStage } from "@/lib/types";

const stageIcons: Record<string, React.ReactNode> = {
  discovery: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  qualification: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  opportunity: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  contact: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  outreach: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  crm: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.9.693 2.166 1.638m-5.8 0V5.25A2.25 2.25 0 0 0 10.5 7.5h-1.5" />
    </svg>
  ),
};

export default function PipelineVisualization({
  stages,
}: {
  stages: PipelineStage[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-saas-border bg-gradient-to-br from-saas-bg via-violet-950/40 to-saas-bg p-6 shadow-xl sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            Customer Acquisition Pipeline
          </h2>
          <p className="text-sm text-violet-300">
            AI-powered workflow — discovery to close
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Pipeline Active
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-1 items-center gap-2 lg:flex-col lg:gap-3">
            <div className="saas-card-hover flex flex-1 flex-col rounded-xl border border-saas-border bg-saas-card p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                {stageIcons[stage.id]}
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
                Step {index + 1}
              </p>
              <h3 className="mt-0.5 font-semibold text-white">{stage.label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {stage.description}
              </p>
              <p className="mt-3 text-2xl font-bold text-white">{stage.count}</p>
            </div>
            {index < stages.length - 1 && (
              <div className="hidden shrink-0 items-center lg:flex lg:w-full lg:max-w-none">
                <div className="pipeline-connector" />
              </div>
            )}
            {index < stages.length - 1 && (
              <div className="flex justify-center py-1 lg:hidden">
                <div className="pipeline-connector h-8 w-0.5 min-w-0 rotate-0" style={{ width: 2, minWidth: 2, backgroundSize: "100% 200%", animation: "pipeline-flow 3s linear infinite" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
