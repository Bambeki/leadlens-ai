"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lead } from "@/lib/types";
import {
  getCachedOpportunities,
  LEADS_UPDATED_EVENT,
  saveOpportunityCache,
} from "@/lib/imported-leads";
import {
  fetchOpportunityFromApi,
  fetchOpportunitiesFromApi,
} from "@/lib/opportunity-api";

export type LeadDataSource =
  | "database"
  | "cache-fallback"
  | "demo-fallback"
  | "loading";

export function useAllLeads(baseLeads: Lead[]) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dataSource, setDataSource] = useState<LeadDataSource>("loading");
  const [dataSourceError, setDataSourceError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetchOpportunitiesFromApi()
      .then((opportunities) => {
        setLeads(opportunities);
        saveOpportunityCache(opportunities);
        setDataSource("database");
        setDataSourceError(null);
      })
      .catch((error) => {
        const cached = getCachedOpportunities();
        if (cached.length > 0) {
          setLeads(cached);
          setDataSource("cache-fallback");
        } else {
          setLeads(baseLeads);
          setDataSource("demo-fallback");
        }
        setDataSourceError(
          error instanceof Error ? error.message : "Database unavailable"
        );
      });
  }, [baseLeads]);

  useEffect(() => {
    refresh();
    window.addEventListener(LEADS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(LEADS_UPDATED_EVENT, refresh);
  }, [refresh]);

  const allLeads = useMemo(() => leads, [leads]);

  return {
    allLeads,
    importedCount: leads.length,
    refresh,
    dataSource,
    dataSourceError,
  };
}

export function useLeadById(baseLeads: Lead[], id: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<LeadDataSource>("loading");
  const [dataSourceError, setDataSourceError] = useState<string | null>(null);

  const fallbackLead = useCallback(() => {
    const cached = getCachedOpportunities().find((l) => l.id === id);
    if (cached) {
      setLead(cached);
      setLoadedId(id);
      setDataSource("cache-fallback");
      return;
    }

    setLead(baseLeads.find((l) => l.id === id) ?? null);
    setLoadedId(id);
    setDataSource("demo-fallback");
  }, [baseLeads, id]);

  useEffect(() => {
    let isCurrent = true;

    fetchOpportunityFromApi(id)
      .then((opportunity) => {
        if (!isCurrent) return;
        setLead(opportunity);
        setLoadedId(id);
        setDataSource("database");
        setDataSourceError(null);
      })
      .catch((error) => {
        if (!isCurrent) return;
        fallbackLead();
        setDataSourceError(
          error instanceof Error ? error.message : "Database unavailable"
        );
      });

    return () => {
      isCurrent = false;
    };
  }, [fallbackLead, id]);

  return {
    lead: loadedId === id ? lead : null,
    dataSource: loadedId === id ? dataSource : "loading",
    dataSourceError: loadedId === id ? dataSourceError : null,
  };
}
