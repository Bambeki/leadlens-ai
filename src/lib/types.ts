export type Priority = "High" | "Medium" | "Low";

export type ScoringFactor =
  | "recentlyOpened"
  | "activeSocialMedia"
  | "multipleLocations"
  | "brandingOpportunity"
  | "regionalProximity";

export type CRMStatus =
  | "Not Contacted"
  | "Contacted"
  | "Responded"
  | "Meeting Scheduled"
  | "Won"
  | "Lost";

export type PipelineStageId =
  | "discovery"
  | "qualification"
  | "opportunity"
  | "outreach"
  | "meeting"
  | "won";

export interface ScoreBreakdown {
  recentlyOpened: number;
  activeSocialMedia: number;
  multipleLocations: number;
  brandingOpportunity: number;
  regionalProximity: number;
  total: number;
}

export type InsightCategory =
  | "opening"
  | "social"
  | "locations"
  | "branding"
  | "visibility";

export interface OpportunityInsight {
  id: string;
  category: InsightCategory;
  finding: string;
  evidence: string;
  scoreImpact: number;
  source: string;
}

export type EvidenceSourceType =
  | "Business Profile"
  | "Website"
  | "Social Profile"
  | "Image Analysis"
  | "Contact Enrichment"
  | "Import";

export interface EvidenceSource {
  sourceName: string;
  sourceType: EvidenceSourceType;
  sourceUrl?: string;
  evidenceSummary: string;
  dateCollected: string;
  confidenceScore: "High" | "Medium" | "Low";
}

export interface DiscoverySource {
  platform: "Google Maps";
  collectedAt: string;
  placeId: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  method: string;
  sourceUrl?: string;
}

export interface BrandingAssessment {
  signQuality: number;
  visibility: number;
  brandingConsistency: number;
  vehicleBranding: number;
}

export interface SignageAudit {
  visibilityScore: number;
  brandingAssessment: BrandingAssessment;
  weaknesses: string[];
  recommendations: string[];
  estimatedValue: { min: number; max: number };
  confidenceScore: number;
  verdict: string;
}

/** @deprecated Use SignageAudit — kept as alias for compatibility */
export type SignageOpportunity = SignageAudit;

export interface Contact {
  name: string;
  email: string;
  role: string;
  linkedIn?: string;
  confidence: "high" | "medium";
}

export interface Lead {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  city: string;
  scoreBreakdown: ScoreBreakdown;
  priority: Priority;
  valuableReasons: string[];
  opportunityInsights: OpportunityInsight[];
  discovery: DiscoverySource;
  evidenceSources: EvidenceSource[];
  signageAudit: SignageAudit;
  contact: Contact;
  crmStatus: CRMStatus;
  recommendedServices: string[];
  estimatedValue: { min: number; max: number };
  factors: Record<ScoringFactor, boolean>;
  imported?: boolean;
  phone?: string;
  website?: string;
}

export interface ScrapedBusiness {
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

export interface ImportSession {
  id: string;
  searchTerm: string;
  city: string;
  scrapedAt: string;
  resultCount: number;
  importedCount: number;
}

export interface StorefrontAnalysis {
  visibilityScore: number;
  problems: string[];
  recommendations: string[];
  estimatedOpportunity: number;
}

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  description: string;
  count: number;
}
