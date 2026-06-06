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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Acquisition Pipeline
        </h1>
        <p className="mt-1 text-slate-500">
          AI-powered customer acquisition — from discovery to close
        </p>
      </div>

      <PipelineVisualization stages={stages} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Discovered via Google Maps</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{leadsWithCrm.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">High-Priority Opportunities</p>
          <p className="mt-1 text-3xl font-bold text-red-600">
            {leadsWithCrm.filter((l) => l.priority === "High").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Contacts Discovered</p>
          <p className="mt-1 text-3xl font-bold text-violet-600">{leadsWithCrm.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pipeline Value</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">
            {formatCurrency(pipelineValue)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadsTable leads={leadsWithCrm} title="Pipeline Leads" />
        </div>
        <CrmFunnel breakdown={crmBreakdown} />
      </div>
    </div>
  );
}
