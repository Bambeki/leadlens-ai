import type { Lead } from "./types";
import { calculateScore, getPriority } from "./scoring";
import { generateOutreachEmail } from "./outreach";
import { generateOpportunityInsights } from "./insights";
import { generateDiscoverySource } from "./discovery";
import { generateContact } from "./contacts";
import { generateSignageAudit } from "./signage-audit";

export const DEMO_STEPS = [
  {
    id: 1,
    title: "Discover",
    label: "Import DHL Fleet Services",
    description: "Scanning logistics companies for vehicle branding opportunities…",
  },
  {
    id: 2,
    title: "Analyze",
    label: "Run Vehicle Branding Audit",
    description: "Analyzing vehicle visibility and wrap gaps…",
  },
  {
    id: 3,
    title: "Score",
    label: "Qualify the lead",
    description: "Running AI scoring across 5 factors…",
  },
  {
    id: 4,
    title: "Recommend",
    label: "Identify wrap services",
    description: "Matching optimal vehicle branding solutions…",
  },
  {
    id: 5,
    title: "Outreach",
    label: "Generate outreach email",
    description: "Crafting personalized vehicle branding outreach…",
  },
] as const;

export const DEMO_STEP_DURATION_MS = 4000;

const demoFactors = {
  recentlyOpened: false,
  activeSocialMedia: true,
  multipleLocations: true,
  brandingOpportunity: true,
  regionalProximity: true,
};

const scoreBreakdown = calculateScore(demoFactors);

const demoLeadBase = {
  id: "demo",
  businessName: "DHL Fleet Services",
  industry: "Logistics Companies",
  location: "Logistikpark 1",
  city: "Bonn",
  factors: demoFactors,
};

const demoRecommendedServices = [
  "Vehicle branding",
  "Van graphics",
  "Full wraps",
];

const demoEstimatedValue = { min: 85000, max: 185000 };

export const demoLead: Lead = {
  ...demoLeadBase,
  scoreBreakdown,
  priority: getPriority(scoreBreakdown.total, demoLeadBase.industry),
  opportunityInsights: generateOpportunityInsights(demoLeadBase),
  discovery: generateDiscoverySource(demoLeadBase),
  signageAudit: generateSignageAudit({
    ...demoLeadBase,
    recommendedServices: demoRecommendedServices,
    estimatedValue: demoEstimatedValue,
    factors: { brandingOpportunity: true, multipleLocations: true },
  }),
  contact: generateContact(demoLeadBase),
  valuableReasons: [
    "120+ delivery vans with inconsistent branding",
    "National vehicle visibility opportunity",
    "High-priority logistics prospect",
  ],
  recommendedServices: demoRecommendedServices,
  estimatedValue: demoEstimatedValue,
  crmStatus: "Not Contacted",
};

export const demoAnalysisInsights = [
  { label: "Fleet Size", value: "120+ delivery vans", icon: "calendar" },
  { label: "Social Activity", value: "Active LinkedIn & vehicle updates", icon: "social" },
  { label: "Google Rating", value: "4.6 ★ (2,400+ reviews)", icon: "star" },
  { label: "Branding Gap", value: "Inconsistent van graphics across depots", icon: "sign" },
  { label: "Daily Impressions", value: "~45K per branded vehicle", icon: "traffic" },
];

export const demoEmail = generateOutreachEmail(demoLead);
