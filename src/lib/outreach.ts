import { LEADLENS_BRAND } from "./branding";
import type { Lead } from "./types";

export interface OutreachCompanyProfile {
  name: string;
  description: string;
  industryFocus?: string | null;
  targetRegion?: string | null;
  targetCustomer?: string | null;
}

export interface GeneratedOutreachDraft {
  subject: string;
  body: string;
  followUp: string;
  source: "openai" | "fallback";
}

const VALUE_PROPS: Record<string, string> = {
  "Construction Companies":
    "Branded trucks and vans make job-site teams easier to recognize and help reinforce trust before the first conversation.",
  Electricians:
    "Professional van graphics help customers recognize service teams quickly and consistently.",
  Plumbers:
    "A wrapped service van signals professionalism and stays visible on residential streets long after the job is done.",
  "Delivery Services":
    "Vehicle branding can make delivery routes more recognizable and support local differentiation.",
  "Landscaping Businesses":
    "Truck and trailer graphics showcase your work quality on every neighborhood route and job site.",
  "Logistics Companies":
    "Consistent vehicle branding across trucks and trailers reinforces reliability and wins B2B contracts.",
};

function firstUseful<T>(items: T[] | undefined, fallback: T): T {
  return items && items.length > 0 ? items[0] : fallback;
}

function getContactGreeting(lead: Lead): string {
  const name = lead.contact.name?.trim();
  if (!name || name.toLowerCase().includes("pending")) {
    return `${lead.businessName} Team`;
  }
  return name;
}

function getOpportunitySignal(lead: Lead): string {
  const insight = lead.opportunityInsights[0];
  if (insight?.finding) return insight.finding;
  return firstUseful(
    lead.valuableReasons,
    `${lead.businessName} appears to be a relevant regional business for vehicle branding review`
  );
}

function getEvidenceLine(lead: Lead): string {
  const source = lead.evidenceSources?.[0];
  if (source) {
    return `${source.sourceName} (${source.sourceType}) indicates that ${source.evidenceSummary}`;
  }
  if (lead.discovery?.sourceUrl) {
    return `${lead.discovery.platform} data for ${lead.businessName}`;
  }
  return `${lead.discovery?.platform ?? "source"} data collected for ${lead.businessName}`;
}

function getRecommendedService(lead: Lead): string {
  return firstUseful(
    lead.recommendedServices,
    "professional vehicle branding and fleet graphics"
  );
}

function getSenderCompany(profile?: OutreachCompanyProfile | null): string {
  return profile?.name?.trim() || LEADLENS_BRAND.name;
}

function getSenderDescription(profile?: OutreachCompanyProfile | null): string {
  return (
    profile?.description?.trim() ||
    "we help businesses improve visibility and brand consistency through professional vehicle branding and fleet graphics"
  );
}

export function generateOutreachDraft(
  lead: Lead,
  profile?: OutreachCompanyProfile | null
): GeneratedOutreachDraft {
  const score = lead.scoreBreakdown.total;
  const contactGreeting = getContactGreeting(lead);
  const opportunitySignal = getOpportunitySignal(lead);
  const evidenceLine = getEvidenceLine(lead);
  const recommendedService = getRecommendedService(lead);
  const senderCompany = getSenderCompany(profile);
  const senderDescription = getSenderDescription(profile);
  const targetRegion = profile?.targetRegion || lead.city;

  const openingLine =
    score >= 70
      ? `I noticed that ${lead.businessName} appears to be a strong fit for vehicle branding support in ${lead.city}.`
      : score >= 40
        ? `I have been reviewing ${lead.industry.toLowerCase()} businesses around ${lead.city}, and ${lead.businessName} stood out as a relevant opportunity.`
        : `I am reaching out because ${lead.businessName} may be able to improve local visibility through professional vehicle branding.`;

  const valueProp =
    VALUE_PROPS[lead.industry] ??
    "Professional vehicle branding helps turn company vehicles into consistent, recognizable brand touchpoints across local routes and job sites.";

  const subject = `Potential vehicle branding support for ${lead.businessName}`;
  const body = `Hi ${contactGreeting},

${openingLine}

The specific reason this came up is: ${opportunitySignal}

At ${senderCompany}, ${senderDescription}. For businesses operating in ${targetRegion}, ${valueProp}

Based on ${evidenceLine}, this could be a good moment to explore whether ${recommendedService.toLowerCase()} could support your current visibility and brand consistency.

Would you be open to a short conversation to review whether vehicle branding could be useful for ${lead.businessName}?

Best regards,
${LEADLENS_BRAND.senderLabel}`;

  const followUp = `Hi ${contactGreeting},

Just following up on my note about vehicle branding support for ${lead.businessName}.

The reason I thought it may be relevant was ${opportunitySignal.toLowerCase()}, supported by ${evidenceLine}.

Would it be worth a brief conversation next week?

Best regards,
${LEADLENS_BRAND.senderLabel}`;

  return { subject, body, followUp, source: "fallback" };
}

export function generateOutreachEmail(
  lead: Lead,
  baseUrl?: string,
  profile?: OutreachCompanyProfile | null
): string {
  void baseUrl;
  const draft = generateOutreachDraft(lead, profile);
  return `Subject: ${draft.subject}\n\n${draft.body}`;
}
