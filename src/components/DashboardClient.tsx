"use client";

import Link from "next/link";
import StatCard from "@/components/StatCard";
import LeadsTable from "@/components/LeadsTable";
import DashboardDemoBanner from "@/components/DashboardDemoBanner";
import UpcomingMeetingsWidget from "@/components/UpcomingMeetingsWidget";
import { useAllLeads } from "@/hooks/useAllLeads";
import { useLeadsWithCrm } from "@/hooks/useCrmOverrides";
import type { Lead } from "@/lib/types";

export default function DashboardClient({ baseLeads }: { baseLeads: Lead[] }) {
  const { allLeads, importedCount } = useAllLeads(baseLeads);
  const leadsWithCrm = useLeadsWithCrm(allLeads);

  const stats = {
    total: leadsWithCrm.length,
    high: leadsWithCrm.filter((l) => l.priority === "High").length,
    medium: leadsWithCrm.filter((l) => l.priority === "Medium").length,
    low: leadsWithCrm.filter((l) => l.priority === "Low").length,
    meetingScheduled: leadsWithCrm.filter(
      (l) => l.crmStatus === "Meeting Scheduled"
    ).length,
  };

  return (
    <div>
      <DashboardDemoBanner />

      {importedCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3">
          <span className="text-sm font-medium text-emerald-800">
            {importedCount} imported lead{importedCount !== 1 ? "s" : ""} from
            Apify scraper active in pipeline
          </span>
          <Link
            href="/lead-import"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Import more →
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Lead Dashboard</h1>
        <p className="mt-1 text-slate-500">
          All discovered leads —{" "}
          <Link href="/pipeline" className="font-medium text-indigo-600 hover:text-indigo-800">
            acquisition pipeline
          </Link>{" "}
          ·{" "}
          <Link href="/lead-import" className="font-medium text-indigo-600 hover:text-indigo-800">
            import new leads
          </Link>
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={stats.total} accent="indigo" icon={<UsersIcon />} />
        <StatCard label="High Priority" value={stats.high} accent="red" icon={<FireIcon />} />
        <StatCard label="Medium Priority" value={stats.medium} accent="amber" icon={<ChartIcon />} />
        <StatCard label="Low Priority" value={stats.low} accent="emerald" icon={<CheckIcon />} />
      </div>

      {stats.meetingScheduled > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
          <span className="text-sm font-medium text-amber-900">
            {stats.meetingScheduled} lead
            {stats.meetingScheduled !== 1 ? "s" : ""} with meetings scheduled —
            CRM funnel updated automatically
          </span>
        </div>
      )}

      <UpcomingMeetingsWidget />

      <LeadsTable leads={leadsWithCrm} />
    </div>
  );
}

function UsersIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.09 9.09 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}
function FireIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
