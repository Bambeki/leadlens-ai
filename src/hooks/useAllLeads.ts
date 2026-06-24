"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lead } from "@/lib/types";
import {
  getImportedLeads,
  LEADS_UPDATED_EVENT,
} from "@/lib/imported-leads";
import { fetchOpportunitiesFromApi } from "@/lib/opportunity-api";

export function useAllLeads(baseLeads: Lead[]) {
  const [imported, setImported] = useState<Lead[]>(() => getImportedLeads());

  const refresh = useCallback(() => {
    fetchOpportunitiesFromApi()
      .then(setImported)
      .catch(() => {
        setImported(getImportedLeads());
      });
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(LEADS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(LEADS_UPDATED_EVENT, refresh);
  }, [refresh]);

  const allLeads = useMemo(
    () => [...baseLeads, ...imported],
    [baseLeads, imported]
  );

  return { allLeads, importedCount: imported.length, refresh };
}

export function useLeadById(baseLeads: Lead[], id: string) {
  const { allLeads } = useAllLeads(baseLeads);
  return allLeads.find((l) => l.id === id);
}
