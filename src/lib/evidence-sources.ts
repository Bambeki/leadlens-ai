import type { EvidenceSource, Lead } from "./types";

interface EvidenceInput {
  businessName: string;
  website?: string;
  discovery: Lead["discovery"];
  opportunityInsights: Lead["opportunityInsights"];
  signageAudit: Lead["signageAudit"];
}

export function generateEvidenceSources(input: EvidenceInput): EvidenceSource[] {
  const businessProfileUrl =
    input.discovery.sourceUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input.businessName)}`;

  const sources: EvidenceSource[] = [
    {
      sourceName: "Google Business Profile",
      sourceType: "Business Profile",
      sourceUrl: businessProfileUrl,
      evidenceSummary: `${input.discovery.rating} star rating, ${input.discovery.reviewCount} reviews, and categories: ${input.discovery.categories.join(", ")}.`,
      dateCollected: input.discovery.collectedAt,
      confidenceScore: input.discovery.reviewCount >= 25 ? "High" : "Medium",
    },
  ];

  if (input.website) {
    sources.push({
      sourceName: "Company Website",
      sourceType: "Website",
      sourceUrl: input.website,
      evidenceSummary: "Website available for contact validation and business context.",
      dateCollected: input.discovery.collectedAt,
      confidenceScore: "Medium",
    });
  }

  const strongestInsight = input.opportunityInsights[0];
  if (strongestInsight) {
    sources.push({
      sourceName: strongestInsight.source,
      sourceType: "Image Analysis",
      evidenceSummary: strongestInsight.evidence,
      dateCollected: input.discovery.collectedAt,
      confidenceScore: input.signageAudit.confidenceScore >= 80 ? "High" : "Medium",
    });
  }

  return sources;
}
