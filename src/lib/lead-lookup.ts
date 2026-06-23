import type { Lead } from "./types";
import { leads as baseLeads } from "./base-data";
import { getImportedLeads } from "./imported-leads";

export function findLeadById(id: string): Lead | undefined {
  const imported = getImportedLeads();
  return [...baseLeads, ...imported].find((l) => l.id === id);
}
