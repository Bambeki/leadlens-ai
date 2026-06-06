"use client";

import Link from "next/link";
import StatCard from "@/components/StatCard";
import LeadsTable from "@/components/LeadsTable";
import FeaturedCustomerStory from "@/components/FeaturedCustomerStory";
import UpcomingMeetingsWidget from "@/components/UpcomingMeetingsWidget";
import { useAllLeads } from "@/hooks/useAllLeads";
import { useLeadsWithCrm } from "@/hooks/useCrmOverrides";
import type { Lead } from "@/lib/types";

export default function DashboardClient({ baseLeads }: { baseLeads: Lead[] }) {
  const { allLeads } = useAllLeads(baseLeads);
  const leadsWithCrm = useLeadsWithCrm(allLeads);

  const stats = {
    total: leadsWithCrm.length,
    qualified: leadsWithCrm.filter(
      (l) => l.priority === "High" || l.scoreBreakdown.total >= 55
    ).length,
    outreachSent: leadsWithCrm.filter((l) =>
      ["Contacted", "Responded", "Meeting Scheduled", "Won"].includes(l.crmStatus)
    ).length,
    meetingsBooked: leadsWithCrm.filter((l) =>
      ["Meeting Scheduled", "Won"].includes(l.crmStatus)
    ).length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Vehicle branding pipeline at a glance —{" "}
          <Link href="/pipeline" className="font-medium text-violet-400 hover:text-violet-300">
            view pipeline
          </Link>
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={stats.total} accent="violet" icon={<UsersIcon />} />
        <StatCard label="Qualified Leads" value={stats.qualified} accent="emerald" icon={<CheckIcon />} />
        <StatCard label="Outreach Sent" value={stats.outreachSent} accent="amber" icon={<MailIcon />} />
        <StatCard label="Meetings Booked" value={stats.meetingsBooked} accent="violet" icon={<CalendarIcon />} />
      </div>

      <FeaturedCustomerStory />

      <UpcomingMeetingsWidget />

      <LeadsTable leads={leadsWithCrm} title="Active Leads" />
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
function CheckIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}
