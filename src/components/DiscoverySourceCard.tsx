import type { DiscoverySource } from "@/lib/types";

export default function DiscoverySourceCard({
  discovery,
}: {
  discovery: DiscoverySource;
}) {
  return (
    <div className="saas-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Lead Discovery
            </h2>
            <p className="text-sm text-slate-400">Discovery pipeline source</p>
          </div>
        </div>
        <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/25">
          {discovery.platform}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Collection Method
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {discovery.method}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Collected
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {new Date(discovery.collectedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Google Rating
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {discovery.rating} ★ ({discovery.reviewCount} reviews)
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Place ID
          </p>
          <p className="mt-1 truncate font-mono text-xs text-slate-300">
            {discovery.placeId}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {discovery.categories.map((cat) => (
          <span
            key={cat}
            className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300"
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
