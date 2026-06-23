import type { CRMStatus } from "@/lib/types";
import { CRM_STATUS_STYLES } from "@/lib/crm";

export default function CrmFunnel({
  breakdown,
}: {
  breakdown: { status: CRMStatus; count: number }[];
}) {
  const max = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <div className="saas-card p-6">
      <h2 className="text-lg font-semibold text-white">Opportunity Status</h2>
      <p className="mt-1 text-sm text-slate-400">
        Customer opportunity progress across the discovery funnel
      </p>
      <div className="mt-5 space-y-3">
        {breakdown.map(({ status, count }) => {
          const style = CRM_STATUS_STYLES[status];
          return (
            <div key={status}>
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${style.text}`}>{status}</span>
                <span className="font-semibold text-white">{count}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${style.dot}`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
