import type { OpportunityInsight, InsightCategory } from "@/lib/types";

const categoryMeta: Record<
  InsightCategory,
  { label: string; icon: React.ReactNode; accent: string }
> = {
  opening: {
    label: "Opening Signal",
    accent: "bg-violet-50 text-violet-600 ring-violet-600/10",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  social: {
    label: "Social Signal",
    accent: "bg-pink-50 text-pink-600 ring-pink-600/10",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v11.18Z" />
      </svg>
    ),
  },
  locations: {
    label: "Expansion Signal",
    accent: "bg-blue-50 text-blue-600 ring-blue-600/10",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008H17.25v-.008Zm0 3h.008v.008H17.25v-.008Zm0 3h.008v.008H17.25v-.008Z" />
      </svg>
    ),
  },
  branding: {
    label: "Branding Gap",
    accent: "bg-amber-50 text-amber-600 ring-amber-600/10",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      </svg>
    ),
  },
  visibility: {
    label: "Location Signal",
    accent: "bg-emerald-50 text-emerald-600 ring-emerald-600/10",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
};

export default function OpportunityInsights({
  insights,
}: {
  insights: OpportunityInsight[];
}) {
  const totalImpact = insights.reduce((sum, i) => sum + i.scoreImpact, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Opportunity Insights
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              AI-generated
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Evidence-based findings explaining this lead&apos;s score
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-right">
          <p className="text-xs font-medium text-slate-500">Score explained</p>
          <p className="text-sm font-bold text-slate-900">
            {totalImpact}{" "}
            <span className="font-normal text-slate-400">/ 100 pts</span>
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {insights.map((insight) => {
          const meta = categoryMeta[insight.category];
          return (
            <div
              key={insight.id}
              className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-indigo-100 hover:bg-indigo-50/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${meta.accent}`}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {insight.finding}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.accent}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {insight.evidence}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Source: {insight.source}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  +{insight.scoreImpact} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
