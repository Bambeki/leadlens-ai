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
    label: "Discover a local electrician",
    description: "Scanning regional trades & fleet businesses for vehicle branding gaps…",
  },
  {
    id: 2,
    title: "Analyze",
    label: "Run Vehicle Branding Audit",
    description: "Analyzing fleet visibility and wrap opportunities…",
  },
  {
    id: 3,
    title: "Score",
    label: "Calculate lead score",
    description: "Running AI scoring model across 5 factors…",
  },
  {
    id: 4,
    title: "Recommend",
    label: "Recommend wrap services",
    description: "Matching optimal vehicle branding solutions…",
  },
  {
    id: 5,
    title: "Outreach",
    label: "Generate outreach email",
    description: "Crafting personalized fleet branding outreach…",
  },
] as const;

const demoFactors = {
  recentlyOpened: true,
  activeSocialMedia: true,
  multipleLocations: true,
  brandingOpportunity: true,
  regionalProximity: true,
};

const scoreBreakdown = calculateScore(demoFactors);

const demoLeadBase = {
  id: "demo",
  businessName: "Strom & Sicher Elektrotechnik",
  industry: "Electricians",
  location: "Industriestraße 8",
  city: "Munich",
  factors: demoFactors,
};

const demoRecommendedServices = [
  "Van graphics",
  "Partial wraps",
  "Fleet branding",
  "Full wraps",
];

const demoEstimatedValue = { min: 3200, max: 7800 };

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
  crmStatus: "Not Contacted",
  valuableReasons: [
    "Recently opened (6 weeks ago)",
    "Active social media presence",
    "4-vehicle fleet with no consistent branding",
    "High vehicle branding opportunity",
    "Within 8 km service radius",
  ],
  recommendedServices: demoRecommendedServices,
  estimatedValue: demoEstimatedValue,
};

export const demoAnalysisInsights = [
  { label: "Fleet Size", value: "4 unmarked service vans", icon: "calendar" },
  { label: "Social Activity", value: "612 followers, 8 posts/week", icon: "social" },
  { label: "Google Rating", value: "4.7 ★ (41 reviews)", icon: "star" },
  { label: "Branding Gap", value: "No branded vans detected", icon: "sign" },
  { label: "Daily Impressions", value: "~18K per vehicle on routes", icon: "traffic" },
];

export const demoEmail = generateOutreachEmail(demoLead);

export const DEMO_STEP_DURATION_MS = 4000;
