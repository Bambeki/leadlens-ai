import type { Priority, ScoreBreakdown, ScoringFactor } from "./types";

export const PRIORITY_INDUSTRIES = [
  "Construction Companies",
  "Electricians",
  "Plumbers",
  "Delivery Services",
  "Landscaping Businesses",
  "Logistics Companies",
] as const;

export type PriorityIndustry = (typeof PRIORITY_INDUSTRIES)[number];

export const SCORE_WEIGHTS: Record<ScoringFactor, number> = {
  recentlyOpened: 25,
  activeSocialMedia: 20,
  multipleLocations: 20,
  brandingOpportunity: 20,
  regionalProximity: 15,
};

export const SCORE_LABELS: Record<ScoringFactor, string> = {
  recentlyOpened: "Recently Opened",
  activeSocialMedia: "Active Social Media",
  multipleLocations: "Multi-Vehicle / Multi-Site",
  brandingOpportunity: "Vehicle Branding Gap",
  regionalProximity: "Regional Proximity",
};

const INDUSTRY_SCORE_BOOST = 12;

export function calculateScore(
  factors: Record<ScoringFactor, boolean>
): ScoreBreakdown {
  const recentlyOpened = factors.recentlyOpened ? SCORE_WEIGHTS.recentlyOpened : 0;
  const activeSocialMedia = factors.activeSocialMedia
    ? SCORE_WEIGHTS.activeSocialMedia
    : 0;
  const multipleLocations = factors.multipleLocations
    ? SCORE_WEIGHTS.multipleLocations
    : 0;
  const brandingOpportunity = factors.brandingOpportunity
    ? SCORE_WEIGHTS.brandingOpportunity
    : 0;
  const regionalProximity = factors.regionalProximity
    ? SCORE_WEIGHTS.regionalProximity
    : 0;

  const total =
    recentlyOpened +
    activeSocialMedia +
    multipleLocations +
    brandingOpportunity +
    regionalProximity;

  return {
    recentlyOpened,
    activeSocialMedia,
    multipleLocations,
    brandingOpportunity,
    regionalProximity,
    total,
  };
}

export function isPriorityIndustry(industry: string): boolean {
  return (PRIORITY_INDUSTRIES as readonly string[]).includes(industry);
}

export function getPriority(score: number, industry?: string): Priority {
  let adjusted = score;
  if (industry && isPriorityIndustry(industry)) {
    adjusted = Math.min(100, score + INDUSTRY_SCORE_BOOST);
  }
  if (adjusted >= 70) return "High";
  if (adjusted >= 40) return "Medium";
  return "Low";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
