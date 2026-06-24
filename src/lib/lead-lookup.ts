import type { Lead } from "./types";
import { leads as baseLeads } from "./base-data";
import { getImportedLeads } from "./imported-leads";

export function findLeadById(id: string): Lead | undefined {
  const imported = getImportedLeads();
  return [...baseLeads, ...imported].find((l) => l.id === id);
}

export async function findLeadByIdFromApi(id: string): Promise<Lead | undefined> {
  try {
    const res = await fetch(`/api/opportunities/${id}`, { cache: "no-store" });
    if (!res.ok) return findLeadById(id);
    const data = await res.json();
    return data.opportunity as Lead | undefined;
  } catch {
    return findLeadById(id);
  }
}
