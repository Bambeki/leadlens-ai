"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/types";
import type { CRMStatus } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";
import CRMStatusBadge from "./CRMStatusBadge";
import {
  FILTER_TABS,
  filterLeads,
  sortLeads,
  getEstimatedRevenue,
  isHighOpportunity,
  type LeadFilter,
  type SortField,
  type SortDirection,
} from "@/lib/lead-utils";
import { formatCurrency } from "@/lib/scoring";
import { useCrmOverrides } from "@/hooks/useCrmOverrides";

function SortHeader({
  label,
  field,
  activeField,
  direction,
  onSort,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  direction: SortDirection;
  onSort: (f: SortField) => void;
}) {
  const active = activeField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-indigo-600"
    >
      {label}
      <span className={`text-xs ${active ? "text-indigo-600" : "text-slate-300"}`}>
        {active ? (direction === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}

export default function LeadsTable({
  leads,
  title = "Leads",
}: {
  leads: Lead[];
  title?: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<LeadFilter>("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const leadsIdsKey = leads.map((l) => l.id).join(",");
  const leadIds = useMemo(
    () => leads.map((l) => l.id),
    [leadsIdsKey]
  );
  const crmOverrides = useCrmOverrides(leadIds);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const displayed = useMemo(() => {
    const filtered = filterLeads(leads, filter, search, crmOverrides);
    return sortLeads(filtered, sortField, sortDir, crmOverrides);
  }, [leads, filter, search, sortField, sortDir, crmOverrides]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Toolbar */}
      <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {displayed.length} of {leads.length} leads · click any row to open
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              placeholder="Search name, industry, city, contact…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-3 sm:px-6">Business</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">
                <SortHeader label="City" field="city" activeField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3">
                <SortHeader label="Score" field="score" activeField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3">
                <SortHeader label="Revenue" field="revenue" activeField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3">
                <SortHeader label="Priority" field="priority" activeField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3">
                <SortHeader label="CRM" field="crmStatus" activeField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </div>
                    <p className="mt-4 font-medium text-slate-900">No leads found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try adjusting your filters or search query.
                    </p>
                    <button
                      onClick={() => {
                        setFilter("all");
                        setSearch("");
                      }}
                      className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Clear all filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              displayed.map((lead) => {
                const crmStatus = crmOverrides[lead.id] ?? lead.crmStatus;
                const highOpp = isHighOpportunity(lead);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    className="group cursor-pointer transition-all duration-200 hover:bg-indigo-50/60"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-700">
                        {lead.businessName}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-red-600/10">
                          Google Maps
                        </span>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-600/10">
                          Email found
                        </span>
                        {lead.imported && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
                            Apify import
                          </span>
                        )}
                        {highOpp && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-600/10">
                            High opportunity
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{lead.industry}</td>
                    <td className="px-4 py-4 text-slate-600">{lead.city}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-14 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              lead.scoreBreakdown.total >= 70
                                ? "bg-red-500"
                                : lead.scoreBreakdown.total >= 40
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${lead.scoreBreakdown.total}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900">
                          {lead.scoreBreakdown.total}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {formatCurrency(getEstimatedRevenue(lead))}
                    </td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={lead.priority} />
                    </td>
                    <td className="px-4 py-4">
                      <CRMStatusBadge status={crmStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-700">{lead.contact.name}</p>
                      <p className="text-xs text-slate-400">{lead.contact.role}</p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
