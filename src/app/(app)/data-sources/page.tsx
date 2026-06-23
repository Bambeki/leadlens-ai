import DataPipelineFlow from "@/components/DataPipelineFlow";
import { DATA_SOURCES } from "@/lib/data-sources";

const accentStyles: Record<string, { bg: string; icon: string; ring: string; badge: string }> = {
  red: {
    bg: "bg-red-500/10",
    icon: "bg-red-500/15 text-red-400",
    ring: "ring-red-500/20",
    badge: "bg-red-500/15 text-red-300 ring-red-500/25",
  },
  indigo: {
    bg: "bg-violet-500/10",
    icon: "bg-violet-500/15 text-violet-400",
    ring: "ring-violet-500/20",
    badge: "bg-violet-500/15 text-violet-300 ring-violet-500/25",
  },
  blue: {
    bg: "bg-blue-500/10",
    icon: "bg-blue-500/15 text-blue-400",
    ring: "ring-blue-500/20",
    badge: "bg-blue-500/15 text-blue-300 ring-blue-500/25",
  },
  pink: {
    bg: "bg-pink-500/10",
    icon: "bg-pink-500/15 text-pink-400",
    ring: "ring-pink-500/20",
    badge: "bg-pink-500/15 text-pink-300 ring-pink-500/25",
  },
  violet: {
    bg: "bg-violet-500/10",
    icon: "bg-violet-500/15 text-violet-400",
    ring: "ring-violet-500/20",
    badge: "bg-violet-500/15 text-violet-300 ring-violet-500/25",
  },
  amber: {
    bg: "bg-amber-500/10",
    icon: "bg-amber-500/15 text-amber-400",
    ring: "ring-amber-500/20",
    badge: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  },
};

function SourceIcon({ type }: { type: string }) {
  const cls = "h-6 w-6";
  switch (type) {
    case "maps":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      );
    case "website":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.582" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.062 2.062 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case "email":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      );
    case "image":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DataSourcesPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-saas-card to-blue-500/10 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
              </svg>
              System Architecture
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white">
              Data Sources & Enrichment
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-slate-300">
              LeadLens AI aggregates data from connected sources, enriches
              each business profile with AI analysis, and transforms raw
              listings into evidence-backed customer opportunities with contact
              context.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-saas-border bg-saas-card px-5 py-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-violet-400">6</p>
              <p className="text-xs text-slate-400">Data Sources</p>
            </div>
            <div className="rounded-xl border border-saas-border bg-saas-card px-5 py-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-violet-400">6</p>
              <p className="text-xs text-slate-400">Pipeline Stages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <DataPipelineFlow />

      {/* How it works */}
      <div className="mt-10 mb-6">
        <h2 className="text-xl font-bold text-white">Enrichment Sources</h2>
        <p className="mt-1 text-slate-400">
          Each discovered business is cross-referenced against all sources below
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {DATA_SOURCES.map((source) => {
          const style = accentStyles[source.accent];
          return (
            <div
              key={source.id}
              className={`overflow-hidden rounded-2xl border bg-saas-card shadow-sm ring-1 ${style.ring}`}
            >
              <div className={`border-b px-6 py-5 ${style.bg}`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                  >
                    <SourceIcon type={source.icon} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {source.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-400">
                      {source.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm leading-relaxed text-slate-300">
                  {source.description}
                </p>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Data Collected
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {source.fields.map((field) => (
                      <li
                        key={field}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <svg
                          className="h-4 w-4 shrink-0 text-emerald-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-7.5"
                          />
                        </svg>
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-saas-border pt-4">
                  <span className="text-xs text-slate-400">Powers:</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style.badge}`}
                  >
                    {source.usedFor}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture summary */}
      <div className="mt-10 rounded-2xl border border-saas-border bg-white/5 p-8">
        <h2 className="text-lg font-bold text-white">
          How LeadLens AI Uses This Data
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-violet-400">1. Discover</p>
            <p className="mt-1 text-sm text-slate-300">
              Apify scrapes Google Maps for businesses within your service
              radius, capturing name, address, ratings, and category.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-400">2. Enrich</p>
            <p className="mt-1 text-sm text-slate-300">
              Websites, LinkedIn, Instagram, and email APIs layer on contacts,
              decision makers, and visual branding signals.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-400">3. Act</p>
            <p className="mt-1 text-sm text-slate-300">
              AI scores each opportunity, runs Vehicle Branding Audits, generates
              outreach, and tracks progress through the opportunity pipeline.
            </p>
          </div>
        </div>
        <p className="mt-6 rounded-lg border border-violet-500/20 bg-saas-card px-4 py-3 text-sm text-slate-400">
          Source records should include name, type, URL, evidence summary,
          collection date, and confidence score before customer outreach begins.
        </p>
      </div>
    </div>
  );
}
