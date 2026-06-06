import type { StorefrontAnalysis } from "./types";

const analysisTemplates: StorefrontAnalysis[] = [
  {
    visibilityScore: 58,
    problems: [
      "Missing vehicle branding on service van",
      "Weak fleet visibility on commercial routes",
      "No branded vans in fleet photos",
    ],
    recommendations: [
      "Full wrap on primary service van",
      "Van graphics with logo and phone number",
      "Fleet branding package for 3+ vehicles",
    ],
    estimatedOpportunity: 4200,
  },
  {
    visibilityScore: 42,
    problems: [
      "Faded partial wrap peeling on doors",
      "Inconsistent vehicle graphics across fleet",
      "Plain white trucks — no mobile advertising",
    ],
    recommendations: [
      "Replace with full vehicle wrap",
      "Truck graphics for high-visibility routes",
      "Unified fleet branding across all units",
    ],
    estimatedOpportunity: 6800,
  },
  {
    visibilityScore: 71,
    problems: [
      "One branded van, rest unmarked",
      "Logo too small on existing van graphics",
    ],
    recommendations: [
      "Extend partial wraps to full fleet",
      "Upgrade van graphics for legibility at distance",
      "Add truck graphics for larger vehicles",
    ],
    estimatedOpportunity: 5500,
  },
  {
    visibilityScore: 35,
    problems: [
      "No vehicle branding detected",
      "Unmarked fleet — missed daily impressions",
      "Hand-painted phone numbers on tailgate only",
    ],
    recommendations: [
      "Full wraps on service vehicles",
      "Van graphics package",
      "Fleet branding rollout plan",
    ],
    estimatedOpportunity: 8500,
  },
  {
    visibilityScore: 63,
    problems: [
      "Inconsistent colors across 4 fleet vehicles",
      "Magnetic signs instead of permanent graphics",
    ],
    recommendations: [
      "Professional fleet branding program",
      "Truck graphics for heavy vehicles",
      "Partial wraps as phase-one upgrade",
    ],
    estimatedOpportunity: 7200,
  },
];

export function analyzeStorefront(fileName: string): StorefrontAnalysis {
  const hash = fileName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % analysisTemplates.length;
  const template = analysisTemplates[index];

  const variance = (hash % 15) - 7;
  const visibilityScore = Math.min(
    100,
    Math.max(20, template.visibilityScore + variance)
  );

  return {
    ...template,
    visibilityScore,
    estimatedOpportunity:
      template.estimatedOpportunity + (hash % 5) * 250,
  };
}
