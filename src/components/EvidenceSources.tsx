import type { EvidenceSource } from "@/lib/types";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const confidenceStyles = {
  High: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25",
  Medium: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
  Low: "bg-slate-500/15 text-slate-400 ring-slate-500/25",
};

export default function EvidenceSources({
  sources,
}: {
  sources: EvidenceSource[];
}) {
  return (
    <div className="saas-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Evidence &amp; Sources
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Every recommendation should be traceable to source evidence.
          </p>
        </div>
        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-400 ring-1 ring-violet-500/25">
          {sources.length || "No"} sources
        </span>
      </div>

      {sources.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-saas-border bg-white/5 p-5">
          <p className="font-medium text-white">No source evidence available yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Import customers to begin collecting evidence, confidence scores, and
            source URLs.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {sources.map((source) => (
            <div
              key={`${source.sourceName}-${source.dateCollected}`}
              className="rounded-lg border border-saas-border bg-white/5 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {source.sourceName}
                    </h3>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-300">
                      {source.sourceType}
                    </span>
                  </div>
                  {source.sourceUrl && (
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm text-violet-400 hover:text-violet-300"
                    >
                      View source
                    </a>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${confidenceStyles[source.confidenceScore]}`}
                >
                  {source.confidenceScore} confidence
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Evidence Summary
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    {source.evidenceSummary}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Collected
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {formatDate(source.dateCollected)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
