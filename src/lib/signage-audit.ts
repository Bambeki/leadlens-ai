import type { BrandingAssessment, SignageAudit } from "./types";
import { isPriorityIndustry } from "./scoring";

interface AuditInput {
  id: string;
  industry: string;
  businessName: string;
  factors: {
    brandingOpportunity: boolean;
    multipleLocations: boolean;
  };
  recommendedServices: string[];
  estimatedValue: { min: number; max: number };
}

function hash(id: string, salt: number): number {
  return id.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + salt), salt);
}

const weaknessPool = [
  "Missing vehicle branding",
  "Weak fleet visibility",
  "No branded vans",
  "Inconsistent vehicle graphics",
  "Unmarked service vehicles on the road",
  "Faded van lettering and peeling decals",
  "Mixed logo versions across fleet",
  "Plain white fleet — zero mobile advertising",
];

const VEHICLE_RECOMMENDATIONS = [
  "Full wraps",
  "Partial wraps",
  "Fleet branding",
  "Truck graphics",
  "Van graphics",
];

function buildAssessment(lead: AuditInput, h: number): BrandingAssessment {
  const needsWork = lead.factors.brandingOpportunity;
  const fleetSize = lead.factors.multipleLocations ? 1.15 : 1;
  const industryBoost = isPriorityIndustry(lead.industry) ? 8 : 0;
  const base = needsWork ? 14 + (h % 20) : 42 + (h % 25);

  const vehicleBase = needsWork
    ? Math.min(55, 12 + (h % 18) + industryBoost)
    : Math.min(75, 38 + (h % 22));

  const scaled = Math.round(base * fleetSize);

  return {
    signQuality: Math.min(95, scaled + (h % 6)),
    visibility: Math.min(95, Math.round(vehicleBase * fleetSize)),
    brandingConsistency: Math.min(95, scaled - 4 + (h % 8)),
    vehicleBranding: Math.min(95, vehicleBase),
  };
}

function buildWeaknesses(lead: AuditInput, h: number): string[] {
  const count = lead.factors.brandingOpportunity ? 3 + (h % 2) : 2;
  const priority = [
    "Missing vehicle branding",
    "Weak fleet visibility",
    "No branded vans",
    "Inconsistent vehicle graphics",
  ];

  const picked: string[] = [];
  for (const w of priority) {
    if (picked.length < count) picked.push(w);
  }

  for (let i = 0; picked.length < count && i < weaknessPool.length; i++) {
    const w = weaknessPool[(h + i * 2) % weaknessPool.length];
    if (!picked.includes(w)) picked.push(w);
  }

  return [...new Set(picked)].slice(0, count + 1);
}

function buildRecommendations(lead: AuditInput, h: number): string[] {
  const fromServices = lead.recommendedServices.filter(Boolean);
  const merged = [...new Set([...fromServices, ...VEHICLE_RECOMMENDATIONS])];
  return merged.slice(0, 3 + (h % 2));
}

function buildVerdict(score: number, industry: string): string {
  if (score <= 35)
    return `Critical fleet branding gap — high-priority ${industry.toLowerCase()} opportunity`;
  if (score <= 55) return `Significant vehicle wrap potential detected`;
  if (score <= 70) return `Moderate fleet branding upgrades recommended`;
  return `Fleet mostly branded — refresh or expansion opportunity`;
}

/** Vehicle Branding Audit — stored as SignageAudit for compatibility */
export function generateSignageAudit(lead: AuditInput): SignageAudit {
  const h = hash(lead.id, 31);
  const brandingAssessment = buildAssessment(lead, h);

  const avgAssessment = Math.round(
    (brandingAssessment.signQuality +
      brandingAssessment.visibility +
      brandingAssessment.brandingConsistency +
      brandingAssessment.vehicleBranding) /
      4
  );

  const visibilityScore = lead.factors.brandingOpportunity
    ? Math.max(12, Math.min(52, avgAssessment))
    : Math.max(42, Math.min(78, avgAssessment));

  const confidenceScore = 78 + (h % 19);

  return {
    visibilityScore,
    brandingAssessment,
    weaknesses: buildWeaknesses(lead, h),
    recommendations: buildRecommendations(lead, h),
    estimatedValue: lead.estimatedValue,
    confidenceScore,
    verdict: buildVerdict(visibilityScore, lead.industry),
  };
}
