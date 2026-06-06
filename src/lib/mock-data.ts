import type { Lead, CRMStatus } from "./types";
import { calculateScore, getPriority } from "./scoring";
import { generateOpportunityInsights } from "./insights";
import { generateDiscoverySource } from "./discovery";
import { generateContact } from "./contacts";
import { generateSignageAudit } from "./signage-audit";

export const FEATURED_LEAD_ID = "1";

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
  crmStatus: CRMStatus;
  imported?: boolean;
}

/** Curated hackathon demo fleet — logistics & delivery prospects only */
const rawLeads: RawLead[] = [
  {
    id: "1",
    businessName: "DHL Fleet Services",
    industry: "Logistics Companies",
    location: "Logistikpark 1",
    city: "Bonn",
    factors: {
      recentlyOpened: false,
      activeSocialMedia: true,
      multipleLocations: true,
      brandingOpportunity: true,
      regionalProximity: true,
    },
    valuableReasons: [
      "120+ delivery vans with inconsistent branding",
      "National vehicle visibility opportunity",
      "High-priority logistics prospect",
    ],
    recommendedServices: ["Vehicle branding", "Van graphics", "Full wraps"],
    estimatedValue: { min: 85000, max: 185000 },
    crmStatus: "Meeting Scheduled",
    imported: true,
  },
  {
    id: "2",
    businessName: "Amazon Logistics Partner",
    industry: "Delivery Services",
    location: "Fulfillment Way 12",
    city: "Berlin",
    factors: {
      recentlyOpened: true,
      activeSocialMedia: true,
      multipleLocations: true,
      brandingOpportunity: true,
      regionalProximity: true,
    },
    valuableReasons: [
      "Growing last-mile vehicle lineup",
      "Unbranded sprinter vans on routes",
      "Active expansion in region",
    ],
    recommendedServices: ["Van graphics", "Vehicle branding", "Partial wraps"],
    estimatedValue: { min: 42000, max: 95000 },
    crmStatus: "Responded",
    imported: true,
  },
  {
    id: "3",
    businessName: "UPS Fleet Operations",
    industry: "Logistics Companies",
    location: "Industriestraße 44",
    city: "Cologne",
    factors: {
      recentlyOpened: false,
      activeSocialMedia: true,
      multipleLocations: true,
      brandingOpportunity: true,
      regionalProximity: true,
    },
    valuableReasons: [
      "Mixed vehicle wrap quality across depots",
      "Strong brand — refresh opportunity",
      "Multi-depot vehicle branding gap",
    ],
    recommendedServices: ["Truck graphics", "Vehicle branding", "Full wraps"],
    estimatedValue: { min: 62000, max: 140000 },
    crmStatus: "Contacted",
  },
  {
    id: "4",
    businessName: "DB Schenker",
    industry: "Logistics Companies",
    location: "Hafenallee 8",
    city: "Hamburg",
    factors: {
      recentlyOpened: false,
      activeSocialMedia: false,
      multipleLocations: true,
      brandingOpportunity: true,
      regionalProximity: false,
    },
    valuableReasons: [
      "Large truck & trailer vehicle lineup",
      "Inconsistent trailer graphics",
      "Enterprise vehicle branding potential",
    ],
    recommendedServices: ["Truck graphics", "Vehicle branding", "Full wraps"],
    estimatedValue: { min: 95000, max: 220000 },
    crmStatus: "Not Contacted",
  },
  {
    id: "5",
    businessName: "FedEx Fleet Solutions",
    industry: "Delivery Services",
    location: "Cargo Ring 3",
    city: "Frankfurt",
    factors: {
      recentlyOpened: false,
      activeSocialMedia: true,
      multipleLocations: true,
      brandingOpportunity: false,
      regionalProximity: true,
    },
    valuableReasons: [
      "Completed full vehicle rebrand Q1",
      "Reference account for enterprise wraps",
      "Won — €112K project closed",
    ],
    recommendedServices: ["Vehicle branding", "Van graphics", "Truck graphics"],
    estimatedValue: { min: 78000, max: 112000 },
    crmStatus: "Won",
  },
];

export const leads: Lead[] = rawLeads.map((raw) => {
  const { crmStatus, imported, ...leadData } = raw;
  const scoreBreakdown = calculateScore(leadData.factors);
  return {
    ...leadData,
    scoreBreakdown,
    priority: getPriority(scoreBreakdown.total, leadData.industry),
    opportunityInsights: generateOpportunityInsights(leadData),
    discovery: generateDiscoverySource(leadData),
    signageAudit: generateSignageAudit(leadData),
    contact: generateContact(leadData),
    crmStatus,
    ...(imported ? { imported: true } : {}),
  };
});

export function getLeadById(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id);
}

export function getFeaturedLead(): Lead {
  return leads.find((l) => l.id === FEATURED_LEAD_ID) ?? leads[0];
}

export function getDashboardStats() {
  return {
    total: leads.length,
    qualified: leads.filter((l) => l.priority === "High" || l.scoreBreakdown.total >= 55).length,
    outreachSent: leads.filter((l) =>
      ["Contacted", "Responded", "Meeting Scheduled", "Won"].includes(l.crmStatus)
    ).length,
    meetingsBooked: leads.filter((l) =>
      ["Meeting Scheduled", "Won"].includes(l.crmStatus)
    ).length,
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
    qualified: stats.qualified,
    analyzed: leads.length,
    contactsFound: leads.length,
    outreachReady: stats.outreachSent,
    pipelineValue: leads
      .filter((l) => !["Lost", "Won"].includes(l.crmStatus))
      .reduce((s, l) => s + (l.estimatedValue.min + l.estimatedValue.max) / 2, 0),
  };
}
