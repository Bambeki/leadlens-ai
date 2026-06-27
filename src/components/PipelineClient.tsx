"use client";

import PipelineVisualization from "@/components/PipelineVisualization";
import CrmFunnel from "@/components/CrmFunnel";
import LeadsTable from "@/components/LeadsTable";
import { useAllLeads } from "@/hooks/useAllLeads";
import { useLeadsWithCrm } from "@/hooks/useCrmOverrides";
import { useHasMounted } from "@/hooks/useHasMounted";
import { getPipelineStages, getCrmBreakdown, getPipelineValue } from "@/lib/pipeline";
import { formatCurrency } from "@/lib/scoring";
import type { Lead } from "@/lib/types";

export default function PipelineClient({ baseLeads }: { baseLeads: Lead[] }) {
  const hasMounted = useHasMounted();
  const { allLeads } = useAllLeads(baseLeads);
  const leadsWithCrm = useLeadsWithCrm(allLeads);
  const stages = getPipelineStages(leadsWithCrm);
  const visibleStages = hasMounted ? stages : getPipelineStages(baseLeads);
  const crmBreakdown = getCrmBreakdown(leadsWithCrm);
  const pipelineValue = getPipelineValue(leadsWithCrm);
  const hasCustomerData = leadsWithCrm.length > 0;

  const qualified = leadsWithCrm.filter(
    (l) => l.priority === "High" || l.scoreBreakdown.total >= 55
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Opportunity Pipeline</h1>
        <p className="mt-1 text-slate-400">
          Track customer opportunities from discovery to conversation
        </p>
      </div>

      <PipelineVisualization stages={visibleStages} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="saas-glow-card p-5">
          <p className="text-sm text-slate-400">Customer Opportunities</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {hasCustomerData ? leadsWithCrm.length : "No data available yet"}
          </p>
          {!hasCustomerData && (
            <p className="mt-1 text-xs text-slate-500">Import customers to begin</p>
          )}
        </div>
        <div className="saas-glow-card p-5">
          <p className="text-sm text-slate-400">Qualified Opportunities</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {hasCustomerData ? qualified : "Analysis pending"}
          </p>
        </div>
        <div className="saas-glow-card p-5">
          <p className="text-sm text-slate-400">In Outreach</p>
          <p className="mt-1 text-2xl font-bold text-violet-400">
            {hasCustomerData
              ? leadsWithCrm.filter((l) =>
                  ["Contacted", "Responded"].includes(l.crmStatus)
                ).length
              : "Analysis pending"}
          </p>
        </div>
        <div className="saas-glow-card p-5">
          <p className="text-sm text-slate-400">Opportunity Value</p>
          <p className="mt-1 text-2xl font-bold text-blue-400">
            {hasCustomerData ? formatCurrency(pipelineValue) : "No data available yet"}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadsTable leads={leadsWithCrm} title="Pipeline Opportunities" />
        </div>
        <CrmFunnel breakdown={crmBreakdown} />
      </div>
    </div>
  );
}
