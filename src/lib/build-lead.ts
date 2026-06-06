import type { Lead, ScoringFactor } from "./types";
import { calculateScore, getPriority, isPriorityIndustry } from "./scoring";
import { generateOpportunityInsights } from "./insights";
import { generateDiscoverySource } from "./discovery";
import { generateContact } from "./contacts";
import { generateSignageAudit } from "./signage-audit";
import { assignInitialCrmStatus } from "./crm";

export interface RawLeadInput {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  city: string;
  factors: Record<ScoringFactor, boolean>;
  valuableReasons: string[];
  recommendedServices: string[];
  estimatedValue: { min: number; max: number };
  imported?: boolean;
  phone?: string;
  website?: string;
  discoveryOverrides?: Partial<Lead["discovery"]>;
}

const servicesByIndustry: Record<string, string[]> = {
  "Construction Companies": ["Truck graphics", "Fleet branding", "Full wraps"],
  Electricians: ["Van graphics", "Partial wraps", "Fleet branding"],
  Plumbers: ["Van graphics", "Full wraps", "Partial wraps"],
  "Delivery Services": ["Van graphics", "Fleet branding", "Full wraps"],
  "Landscaping Businesses": ["Truck graphics", "Van graphics", "Fleet branding"],
  "Logistics Companies": ["Truck graphics", "Fleet branding", "Full wraps"],
};

const valueByIndustry: Record<string, { min: number; max: number }> = {
  "Construction Companies": { min: 8500, max: 22000 },
  Electricians: { min: 2800, max: 6500 },
  Plumbers: { min: 2500, max: 5800 },
  "Delivery Services": { min: 4500, max: 14000 },
  "Landscaping Businesses": { min: 3500, max: 9500 },
  "Logistics Companies": { min: 12000, max: 28000 },
};

export function buildLead(raw: RawLeadInput): Lead {
  const scoreBreakdown = calculateScore(raw.factors);
  const discovery = {
    ...generateDiscoverySource(raw),
    ...raw.discoveryOverrides,
  };

  return {
    ...raw,
    scoreBreakdown,
    priority: getPriority(scoreBreakdown.total, raw.industry),
    opportunityInsights: generateOpportunityInsights(raw),
    discovery,
    signageAudit: generateSignageAudit(raw),
    contact: generateContact(raw),
    crmStatus: "Not Contacted",
  };
}

export function inferIndustry(searchTerm: string): string {
  const term = searchTerm.toLowerCase();
  if (term.includes("electric") || term.includes("elektro")) return "Electricians";
  if (term.includes("plumb") || term.includes("sanitär") || term.includes("sanitar"))
    return "Plumbers";
  if (term.includes("deliver") || term.includes("courier") || term.includes("kurier"))
    return "Delivery Services";
  if (term.includes("landscap") || term.includes("garden") || term.includes("garten"))
    return "Landscaping Businesses";
  if (term.includes("logistic") || term.includes("transport") || term.includes("spedition"))
    return "Logistics Companies";
  if (term.includes("construction") || term.includes("bau")) return "Construction Companies";
  return searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
}

function hashStr(s: string): number {
  return s.split("").reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
}

export function buildLeadFromScraped(
  scraped: {
    id: string;
    businessName: string;
    rating: number;
    reviewCount: number;
    website: string;
    phone: string;
    address: string;
    city: string;
    searchTerm: string;
    category: string;
  }
): Lead {
  const h = hashStr(scraped.id + scraped.businessName);
  const industry = inferIndustry(scraped.searchTerm);

  const factors: Record<ScoringFactor, boolean> = {
    recentlyOpened: h % 3 === 0,
    activeSocialMedia: scraped.reviewCount > 15,
    multipleLocations: h % 5 === 0 || industry === "Logistics Companies",
    brandingOpportunity: scraped.rating < 4.5 || h % 2 === 0,
    regionalProximity: true,
  };

  const baseValue = valueByIndustry[industry] ?? { min: 3000, max: 7500 };

  const valuableReasons = [
    factors.recentlyOpened && "Recently opened",
    factors.activeSocialMedia && "Active social media",
    factors.brandingOpportunity && "Vehicle branding opportunity",
    isPriorityIndustry(industry) && "Priority fleet industry",
    "Discovered via Apify Google Maps Scraper",
    scraped.rating >= 4.0 && "Strong customer ratings",
  ].filter(Boolean) as string[];

  return buildLead({
    id: scraped.id,
    businessName: scraped.businessName,
    industry,
    location: scraped.address,
    city: scraped.city,
    factors,
    valuableReasons,
    recommendedServices: servicesByIndustry[industry] ?? [
      "Van graphics",
      "Partial wraps",
    ],
    estimatedValue: {
      min: baseValue.min + (h % 5) * 200,
      max: baseValue.max + (h % 8) * 400,
    },
    imported: true,
    phone: scraped.phone,
    website: scraped.website,
    discoveryOverrides: {
      rating: scraped.rating,
      reviewCount: scraped.reviewCount,
      method: "Apify Google Maps Scraper",
      categories: [scraped.category],
    },
  });
}
