import type { ImportSession, Lead, ScrapedBusiness } from "./types";
import { buildLeadFromScraped } from "./build-lead";
import { uniqueId } from "./unique-id";

const LEADS_KEY = "leadlens-imported-leads";
const OPPORTUNITY_CACHE_KEY = "leadlens-opportunity-cache";
const SESSIONS_KEY = "leadlens-import-sessions";

export const LEADS_UPDATED_EVENT = "leadlens-leads-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getImportedLeads(): Lead[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

export function saveImportedLeads(leads: Lead[]) {
  if (!isBrowser()) return;
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  window.dispatchEvent(new CustomEvent(LEADS_UPDATED_EVENT));
}

export function getCachedOpportunities(): Lead[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(OPPORTUNITY_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

export function saveOpportunityCache(leads: Lead[]) {
  if (!isBrowser()) return;
  localStorage.setItem(OPPORTUNITY_CACHE_KEY, JSON.stringify(leads));
}

export function getImportSessions(): ImportSession[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as ImportSession[]) : [];
  } catch {
    return [];
  }
}

function saveSession(session: ImportSession) {
  if (!isBrowser()) return;
  const sessions = getImportSessions();
  localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...sessions].slice(0, 20)));
}

export function recordImportSession(
  searchTerm: string,
  city: string,
  resultCount: number,
  importedCount: number
) {
  saveSession({
    id: uniqueId("session-"),
    searchTerm,
    city,
    scrapedAt: new Date().toISOString(),
    resultCount,
    importedCount,
  });
}

export function buildLeadsForImport(
  businesses: ScrapedBusiness[],
  existingLeads: Lead[] = []
): Lead[] {
  const existingIds = new Set(existingLeads.map((l) => l.id));
  const existingNames = new Set(
    existingLeads.map((l) => `${l.businessName.toLowerCase()}-${l.city.toLowerCase()}`)
  );

  const newLeads: Lead[] = [];

  for (const biz of businesses) {
    const nameKey = `${biz.businessName.toLowerCase()}-${biz.city.toLowerCase()}`;
    if (existingIds.has(biz.id) || existingNames.has(nameKey)) continue;

    const lead = buildLeadFromScraped(biz);
    newLeads.push(lead);
    existingIds.add(lead.id);
    existingNames.add(nameKey);
  }

  return newLeads;
}

export function importBusinessesToPipeline(
  businesses: ScrapedBusiness[],
  searchTerm: string,
  city: string
): Lead[] {
  const existing = getImportedLeads();
  const newLeads = buildLeadsForImport(businesses, existing);

  const merged = [...existing, ...newLeads];
  saveImportedLeads(merged);
  recordImportSession(searchTerm, city, businesses.length, newLeads.length);

  return newLeads;
}

export function getImportedLeadById(id: string): Lead | undefined {
  return getImportedLeads().find((l) => l.id === id);
}

export function clearImportedLeads() {
  if (!isBrowser()) return;
  localStorage.removeItem(LEADS_KEY);
  window.dispatchEvent(new CustomEvent(LEADS_UPDATED_EVENT));
}
