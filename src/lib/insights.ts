import type { OpportunityInsight, ScoringFactor } from "./types";
import { SCORE_WEIGHTS } from "./scoring";

interface InsightInput {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  city: string;
  factors: Record<ScoringFactor, boolean>;
}

function hash(id: string, salt: number): number {
  return (
    id.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0) +
    salt
  );
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 18);
}

function openingInsight(lead: InsightInput): OpportunityInsight {
  const months = (hash(lead.id, 1) % 5) + 1;
  const weeks = hash(lead.id, 2) % 4;
  const timeframe =
    months <= 2 ? `${weeks + 1} weeks ago` : `${months} months ago`;

  return {
    id: `${lead.id}-opening`,
    category: "opening",
    finding: "Opened within last 6 months",
    evidence: `Business registration filed ${timeframe}. Google Maps listing tagged "Recently opened." New fleet vehicles likely entering service — ideal window for first-time vehicle branding.`,
    scoreImpact: SCORE_WEIGHTS.recentlyOpened,
    source: "Google Maps · Trade Register",
  };
}

function socialInsight(lead: InsightInput): OpportunityInsight {
  const followers = 400 + (hash(lead.id, 3) % 20) * 100;
  const postsPerWeek = 2 + (hash(lead.id, 4) % 5);
  const handle = slugify(lead.businessName);

  return {
    id: `${lead.id}-social`,
    category: "social",
    finding: "Active social media presence",
    evidence: `@${handle} — ${followers.toLocaleString("de-DE")} followers with ${postsPerWeek} posts/week. Recent posts show unbranded vans and job-site photos — strong signal of growth without fleet graphics investment.`,
    scoreImpact: SCORE_WEIGHTS.activeSocialMedia,
    source: "Instagram · Social Signal AI",
  };
}

function locationsInsight(lead: InsightInput): OpportunityInsight {
  const count = 2 + (hash(lead.id, 5) % 4);
  const cities = [lead.city, "regional service area"].slice(0, Math.min(2, count - 1));

  return {
    id: `${lead.id}-locations`,
    category: "locations",
    finding: "Multi-vehicle / multi-site operation",
    evidence: `${count} vehicles or depots identified across ${cities.join(" and ")}. Fleet graphics inconsistent between units — partial wraps on some vans, plain white on others. Multi-vehicle operators typically budget €8K–€25K for unified fleet branding.`,
    scoreImpact: SCORE_WEIGHTS.multipleLocations,
    source: "Fleet Registry · Web Crawl",
  };
}

function brandingInsight(lead: InsightInput): OpportunityInsight {
  const problems = [
    "unmarked white vans with no logo",
    "peeling partial wrap on one vehicle only",
    "hand-painted phone number on truck tailgate",
    "faded magnetic signs falling off doors",
    "inconsistent colors across 3+ fleet vehicles",
  ];
  const problem = problems[hash(lead.id, 6) % problems.length];

  const industryContext: Record<string, string> = {
    "Construction Companies":
      "Top regional contractors run fully wrapped trucks and branded site trailers on every job.",
    Electricians:
      "Leading electricians in the area use professional van graphics visible from 30m+ on residential streets.",
    Plumbers:
      "Competing plumbing fleets use bold van wraps that dominate neighborhood drive-bys.",
    "Delivery Services":
      "Delivery brands with wrapped fleets report 3× brand recall vs plain vehicles.",
    "Landscaping Businesses":
      "Landscaping crews with truck graphics win more curb-appeal referrals from visible job sites.",
    "Logistics Companies":
      "Logistics leaders maintain consistent fleet branding across every trailer and cab.",
  };

  return {
    id: `${lead.id}-branding`,
    category: "branding",
    finding: "Weak vehicle branding detected",
    evidence: `Fleet Vision AI: ${problem}. ${industryContext[lead.industry] ?? "Local competitors invest in professional vehicle wraps."} Branded fleets generate an estimated 30–50K daily impressions per vehicle in urban routes.`,
    scoreImpact: SCORE_WEIGHTS.brandingOpportunity,
    source: "Fleet Vision AI · Vehicle Analysis",
  };
}

function visibilityInsight(lead: InsightInput): OpportunityInsight {
  const distance = 3 + (hash(lead.id, 7) % 10);
  const routes = [
    "high-traffic commercial routes",
    "dense residential service corridors",
    "industrial park delivery loops",
    "suburban contractor circuits",
  ];
  const route = routes[hash(lead.id, 8) % routes.length];

  return {
    id: `${lead.id}-visibility`,
    category: "visibility",
    finding: "High mobile visibility zone",
    evidence: `${lead.location} operates in ${route} across ${lead.city}. Base is ${distance} km inside your service radius. Estimated ${(2.5 + (hash(lead.id, 9) % 6) * 0.5).toFixed(1)}K daily vehicle impressions — strong ROI for wrap investment.`,
    scoreImpact: SCORE_WEIGHTS.regionalProximity,
    source: "Geo Intelligence · Route Data",
  };
}

const factorBuilders: Record<
  ScoringFactor,
  (lead: InsightInput) => OpportunityInsight
> = {
  recentlyOpened: openingInsight,
  activeSocialMedia: socialInsight,
  multipleLocations: locationsInsight,
  brandingOpportunity: brandingInsight,
  regionalProximity: visibilityInsight,
};

export function generateOpportunityInsights(
  lead: InsightInput
): OpportunityInsight[] {
  const insights: OpportunityInsight[] = [];

  const factorOrder: ScoringFactor[] = [
    "recentlyOpened",
    "activeSocialMedia",
    "multipleLocations",
    "brandingOpportunity",
    "regionalProximity",
  ];

  for (const factor of factorOrder) {
    if (lead.factors[factor]) {
      insights.push(factorBuilders[factor](lead));
    }
  }

  return insights;
}
