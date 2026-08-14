"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LeadsTable from "@/components/LeadsTable";
import { fetchOpportunitiesFromApi } from "@/lib/opportunity-api";
import { LEADS_UPDATED_EVENT } from "@/lib/imported-leads";
import type { Lead } from "@/lib/types";

export default function ArchivedOpportunitiesClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetchOpportunitiesFromApi("archived")
      .then((opportunities) => {
        setLeads(opportunities);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load archived opportunities.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(LEADS_UPDATED_EVENT, load);
    return () => window.removeEventListener(LEADS_UPDATED_EVENT, load);
  }, [load]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Archived Opportunities</h1>
        <p className="mt-1 text-slate-400">
          Archived and Do Not Contact records stay in the database with their history.{" "}
          <Link href="/dashboard" className="font-medium text-violet-400 hover:text-violet-300">
            Back to dashboard
          </Link>
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading archived opportunities...</p>
      ) : (
        <LeadsTable leads={leads} title="Archived and Do Not Contact" />
      )}
    </div>
  );
}
