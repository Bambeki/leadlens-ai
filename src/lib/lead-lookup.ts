import type { Lead } from "./types";
import { leads as baseLeads } from "./base-data";
import { getCachedOpportunities, getImportedLeads } from "./imported-leads";
import { fetchOpportunityFromApi } from "./opportunity-api";

export function findLeadById(id: string): Lead | undefined {
  const cached = getCachedOpportunities();
  const imported = getImportedLeads();
  return [...cached, ...imported, ...baseLeads].find((l) => l.id === id);
}

export async function findLeadByIdFromApi(id: string): Promise<Lead | undefined> {
  try {
    return (await fetchOpportunityFromApi(id)) ?? undefined;
  } catch {
    return findLeadById(id);
  }
}
