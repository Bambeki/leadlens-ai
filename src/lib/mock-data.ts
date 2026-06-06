import type { Lead } from "./types";
import { calculateScore, getPriority } from "./scoring";
import { generateOpportunityInsights } from "./insights";
import { generateDiscoverySource } from "./discovery";
import { generateContact } from "./contacts";
import { generateSignageAudit } from "./signage-audit";
import { assignInitialCrmStatus } from "./crm";

interface RawLead {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  city: string;
  factors: Lead["factors"];
  valuableReasons: string[];
  recommendedServices: string[];
  estimatedValue: { min: number; max: number };
}

const rawLeads: RawLead[] = [
  {
    id: "1",
    businessName: "NordBau Construction GmbH",
    industry: "Construction Companies",
    location: "Gewerbepark 22",
    city: "Hamburg",
    factors: { recentlyOpened: false, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Multi-vehicle fleet", "Vehicle branding opportunity", "Priority fleet industry"],
    recommendedServices: ["Truck graphics", "Fleet branding", "Full wraps"],
    estimatedValue: { min: 12000, max: 24000 },
  },
  {
    id: "2",
    businessName: "BauPro Solutions AG",
    industry: "Construction Companies",
    location: "Technikpark 15",
    city: "Dresden",
    factors: { recentlyOpened: false, activeSocialMedia: false, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Large fleet", "Vehicle branding opportunity", "Strong growth potential"],
    recommendedServices: ["Fleet branding", "Truck graphics", "Full wraps"],
    estimatedValue: { min: 15000, max: 28000 },
  },
  {
    id: "3",
    businessName: "HochTief Regionalbau",
    industry: "Construction Companies",
    location: "Baustraße 33",
    city: "Essen",
    factors: { recentlyOpened: false, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Active social media", "Multi-vehicle fleet", "Vehicle branding opportunity"],
    recommendedServices: ["Truck graphics", "Full wraps", "Fleet branding"],
    estimatedValue: { min: 9500, max: 22000 },
  },
  {
    id: "4",
    businessName: "Strom & Sicher Elektrotechnik",
    industry: "Electricians",
    location: "Industriestraße 8",
    city: "Munich",
    factors: { recentlyOpened: true, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Recently opened", "4-van fleet unmarked", "Vehicle branding opportunity"],
    recommendedServices: ["Van graphics", "Partial wraps", "Fleet branding"],
    estimatedValue: { min: 3200, max: 7800 },
  },
  {
    id: "5",
    businessName: "VoltWerk Meisterbetrieb",
    industry: "Electricians",
    location: "Energieweg 4",
    city: "Frankfurt",
    factors: { recentlyOpened: false, activeSocialMedia: true, multipleLocations: false, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Active social media", "Vehicle branding opportunity", "Priority fleet industry"],
    recommendedServices: ["Van graphics", "Full wraps", "Partial wraps"],
    estimatedValue: { min: 2800, max: 6200 },
  },
  {
    id: "6",
    businessName: "Elektro Schmidt 24h",
    industry: "Electricians",
    location: "Ringstraße 19",
    city: "Cologne",
    factors: { recentlyOpened: true, activeSocialMedia: false, multipleLocations: false, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Recently opened", "Emergency van fleet", "Vehicle branding opportunity"],
    recommendedServices: ["Van graphics", "Partial wraps"],
    estimatedValue: { min: 2400, max: 5200 },
  },
  {
    id: "7",
    businessName: "Sanitär König Meister",
    industry: "Plumbers",
    location: "Wasserstraße 11",
    city: "Stuttgart",
    factors: { recentlyOpened: true, activeSocialMedia: true, multipleLocations: false, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Recently opened", "Active social media", "Unbranded service vans"],
    recommendedServices: ["Van graphics", "Full wraps", "Partial wraps"],
    estimatedValue: { min: 2600, max: 5800 },
  },
  {
    id: "8",
    businessName: "RohrFix Notdienst",
    industry: "Plumbers",
    location: "Kanalweg 6",
    city: "Berlin",
    factors: { recentlyOpened: false, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Multi-van fleet", "Vehicle branding opportunity", "Priority fleet industry"],
    recommendedServices: ["Fleet branding", "Van graphics", "Full wraps"],
    estimatedValue: { min: 4500, max: 9500 },
  },
  {
    id: "9",
    businessName: "Haustechnik Weber",
    industry: "Plumbers",
    location: "Gartenallee 2",
    city: "Nuremberg",
    factors: { recentlyOpened: false, activeSocialMedia: false, multipleLocations: false, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Vehicle branding opportunity", "High local visibility routes"],
    recommendedServices: ["Van graphics", "Partial wraps"],
    estimatedValue: { min: 2200, max: 4800 },
  },
  {
    id: "10",
    businessName: "ExpressKurier München",
    industry: "Delivery Services",
    location: "Logistikring 7",
    city: "Munich",
    factors: { recentlyOpened: true, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Recently opened", "Growing delivery fleet", "Vehicle branding opportunity"],
    recommendedServices: ["Fleet branding", "Van graphics", "Full wraps"],
    estimatedValue: { min: 6500, max: 16000 },
  },
  {
    id: "11",
    businessName: "CityDrop Same-Day",
    industry: "Delivery Services",
    location: "Paketstraße 44",
    city: "Berlin",
    factors: { recentlyOpened: false, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: false },
    valuableReasons: ["Active social media", "Multi-vehicle fleet", "Vehicle branding opportunity"],
    recommendedServices: ["Van graphics", "Fleet branding", "Partial wraps"],
    estimatedValue: { min: 5200, max: 12500 },
  },
  {
    id: "12",
    businessName: "QuickParcel Rhein",
    industry: "Delivery Services",
    location: "Hafenallee 9",
    city: "Düsseldorf",
    factors: { recentlyOpened: false, activeSocialMedia: false, multipleLocations: false, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Vehicle branding opportunity", "Urban delivery routes"],
    recommendedServices: ["Van graphics", "Full wraps"],
    estimatedValue: { min: 3800, max: 8200 },
  },
  {
    id: "13",
    businessName: "GrünFläche Landschaftsbau",
    industry: "Landscaping Businesses",
    location: "Feldrain 3",
    city: "Hanover",
    factors: { recentlyOpened: true, activeSocialMedia: true, multipleLocations: false, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Recently opened", "Truck + trailer fleet", "Vehicle branding opportunity"],
    recommendedServices: ["Truck graphics", "Van graphics", "Fleet branding"],
    estimatedValue: { min: 4200, max: 9800 },
  },
  {
    id: "14",
    businessName: "GardenPro Gartenbau",
    industry: "Landscaping Businesses",
    location: "Blumenweg 17",
    city: "Leipzig",
    factors: { recentlyOpened: false, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Multi-vehicle operation", "Active social media", "Vehicle branding opportunity"],
    recommendedServices: ["Truck graphics", "Fleet branding", "Partial wraps"],
    estimatedValue: { min: 5500, max: 11500 },
  },
  {
    id: "15",
    businessName: "NaturGestalt Außenanlagen",
    industry: "Landscaping Businesses",
    location: "Parkstraße 28",
    city: "Freiburg",
    factors: { recentlyOpened: false, activeSocialMedia: false, multipleLocations: false, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Vehicle branding opportunity", "Job-site visibility"],
    recommendedServices: ["Van graphics", "Truck graphics"],
    estimatedValue: { min: 3500, max: 7500 },
  },
  {
    id: "16",
    businessName: "TransLogix Spedition",
    industry: "Logistics Companies",
    location: "Autobahnkreuz 1",
    city: "Frankfurt",
    factors: { recentlyOpened: false, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Large truck fleet", "Vehicle branding opportunity", "Priority fleet industry"],
    recommendedServices: ["Truck graphics", "Fleet branding", "Full wraps"],
    estimatedValue: { min: 18000, max: 32000 },
  },
  {
    id: "17",
    businessName: "RheinCargo Transport",
    industry: "Logistics Companies",
    location: "Hafenstraße 55",
    city: "Cologne",
    factors: { recentlyOpened: true, activeSocialMedia: true, multipleLocations: true, brandingOpportunity: true, regionalProximity: true },
    valuableReasons: ["Recently opened depot", "Growing fleet", "Vehicle branding opportunity"],
    recommendedServices: ["Fleet branding", "Truck graphics", "Full wraps"],
    estimatedValue: { min: 14000, max: 28000 },
  },
  {
    id: "18",
    businessName: "AlpenSpedition GmbH",
    industry: "Logistics Companies",
    location: "Gewerbezone 12",
    city: "Augsburg",
    factors: { recentlyOpened: false, activeSocialMedia: false, multipleLocations: true, brandingOpportunity: true, regionalProximity: false },
    valuableReasons: ["Multi-truck fleet", "Inconsistent trailer branding", "Vehicle branding opportunity"],
    recommendedServices: ["Truck graphics", "Fleet branding"],
    estimatedValue: { min: 12000, max: 26000 },
  },
];

export const leads: Lead[] = rawLeads.map((raw) => {
  const scoreBreakdown = calculateScore(raw.factors);
  return {
    ...raw,
    scoreBreakdown,
    priority: getPriority(scoreBreakdown.total, raw.industry),
    opportunityInsights: generateOpportunityInsights(raw),
    discovery: generateDiscoverySource(raw),
    signageAudit: generateSignageAudit(raw),
    contact: generateContact(raw),
    crmStatus: assignInitialCrmStatus(raw.id),
  };
});

export function getLeadById(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id);
}

export function getDashboardStats() {
  return {
    total: leads.length,
    high: leads.filter((l) => l.priority === "High").length,
    medium: leads.filter((l) => l.priority === "Medium").length,
    low: leads.filter((l) => l.priority === "Low").length,
  };
}

export function getPipelineStats() {
  const stats = getDashboardStats();
  return {
    ...stats,
    discovered: leads.length,
    qualified: leads.length,
    analyzed: leads.length,
    contactsFound: leads.length,
    outreachReady: leads.filter((l) => l.priority === "High").length,
    pipelineValue: leads.reduce(
      (s, l) => s + (l.estimatedValue.min + l.estimatedValue.max) / 2,
      0
    ),
  };
}
