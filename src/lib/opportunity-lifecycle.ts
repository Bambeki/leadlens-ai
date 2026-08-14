import { randomBytes } from "crypto";
import type { Lead, OpportunityListScope, OptOutReason, PublicCustomerAction } from "./types";

export type { PublicCustomerAction };

export const PUBLIC_CUSTOMER_ACTIONS: PublicCustomerAction[] = [
  "interested",
  "schedule",
  "not_interested",
];

export function generatePublicResponseToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isValidPublicResponseToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,64}$/.test(token);
}

export function emailIncludesPublicResponseLink(
  token: string,
  text?: string,
  html?: string
): boolean {
  if (!isValidPublicResponseToken(token)) return false;
  const marker = `/r/${token}`;
  return Boolean(text?.includes(marker) || html?.includes(marker));
}

export function isExcludedFromActivePipeline(lead: Pick<Lead, "archivedAt" | "doNotContact">): boolean {
  return Boolean(lead.archivedAt) || Boolean(lead.doNotContact);
}

export function isOutreachBlocked(lead: Pick<Lead, "archivedAt" | "doNotContact">): boolean {
  return isExcludedFromActivePipeline(lead);
}

export function parseOpportunityListScope(value: string | null): OpportunityListScope {
  if (value === "archived" || value === "all") return value;
  return "active";
}

export function parseOptOutReason(value: unknown): OptOutReason {
  return value === "unsubscribe" ? "unsubscribe" : "not_interested";
}

export class OutreachBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OutreachBlockedError";
  }
}

export function getPublicAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel}`;
  }

  return "";
}
