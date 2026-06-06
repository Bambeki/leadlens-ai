"use client";

import PipelineVisualization from "@/components/PipelineVisualization";
import CrmFunnel from "@/components/CrmFunnel";
import LeadsTable from "@/components/LeadsTable";
import { useAllLeads } from "@/hooks/useAllLeads";
import { useLeadsWithCrm } from "@/hooks/useCrmOverrides";
import { getPipelineStages, getCrmBreakdown, getPipelineValue } from "@/lib/pipeline";
import { formatCurrency } from "@/lib/scoring";
import type { Lead } from "@/lib/types";

export default function PipelineClient({ baseLeads }: { baseLeads: Lead[] }) {
  const { allLeads } = useAllLeads(baseLeads);
  const leadsWithCrm = useLeadsWithCrm(allLeads);
  const stages = getPipelineStages(leadsWithCrm);
  const crmBreakdown = getCrmBreakdown(leadsWithCrm);
  const pipelineValue = getPipelineValue(leadsWithCrm);

  const qualified = leadsWithCrm.filter(
    (l) => l.priority === "High" || l.scoreBreakdown.total >= 55
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Pipeline</h1>
        <p className="mt-1 text-slate-400">
          Track every vehicle branding opportunity from discovery to close
        </p>
      </div>

      <PipelineVisualization stages={stages} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="saas-glow-card p-5">
          <p className="text-sm text-slate-400">Total Prospects</p>
          <p className="mt-1 text-3xl font-bold text-white">{leadsWithCrm.length}</p>
        </div>
        <div className="saas-glow-card p-5">
          <p className="text-sm text-slate-400">Qualified</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">{qualified}</p>
        </div>
        <div className="saas-glow-card p-5">
          <p className="text-sm text-slate-400">In Outreach</p>
          <p className="mt-1 text-3xl font-bold text-violet-400">
            {leadsWithCrm.filter((l) =>
              ["Contacted", "Responded"].includes(l.crmStatus)
            ).length}
          </p>
        </div>
        <div className="saas-glow-card p-5">
          <p className="text-sm text-slate-400">Pipeline Value</p>
          <p className="mt-1 text-3xl font-bold text-blue-400">
            {formatCurrency(pipelineValue)}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadsTable leads={leadsWithCrm} title="Pipeline Leads" />
        </div>
        <CrmFunnel breakdown={crmBreakdown} />
      </div>
    </div>
  );
}
