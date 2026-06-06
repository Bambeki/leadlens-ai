"use client";

import { useEffect, useMemo, useState } from "react";
import type { CRMStatus, Lead } from "@/lib/types";
import { CRM_UPDATED_EVENT, getAllCrmOverrides } from "@/lib/crm-store";

export function useCrmOverrides(leadIds?: string[]) {
  const [overrides, setOverrides] = useState<Record<string, CRMStatus>>({});

  const leadIdsKey = useMemo(() => leadIds?.join(",") ?? "", [leadIds]);

  useEffect(() => {
    const ids = leadIdsKey ? leadIdsKey.split(",") : undefined;

    const apply = () => {
      const nextOverrides = getAllCrmOverrides(ids);

      setOverrides((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(nextOverrides)) {
          return prev;
        }
        return nextOverrides;
      });
    };

    apply();

    window.addEventListener(CRM_UPDATED_EVENT, apply);
    return () => window.removeEventListener(CRM_UPDATED_EVENT, apply);
  }, [leadIdsKey]);

  return overrides;
}

export function useLeadsWithCrm(leads: Lead[]): Lead[] {
  const leadIdsKey = useMemo(() => leads.map((l) => l.id).join(","), [leads]);

  const leadIds = useMemo(
    () => (leadIdsKey ? leadIdsKey.split(",") : []),
    [leadIdsKey]
  );

  const overrides = useCrmOverrides(leadIds);

  return useMemo(
    () =>
      leads.map((lead) => ({
        ...lead,
        crmStatus: overrides[lead.id] ?? lead.crmStatus,
      })),
    [leads, overrides]
  );
}
