import { LEADLENS_BRAND } from "./branding";
import type { Lead } from "./types";

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

export function generateOutreachEmail(lead: Lead, baseUrl?: string): string {
  void baseUrl;
  const score = lead.scoreBreakdown.total;

  const openingLine =
    score >= 70
      ? `I noticed ${lead.businessName} has been expanding in the ${lead.industry.toLowerCase()} space — impressive growth in ${lead.city}!`
      : score >= 40
        ? `I've been researching ${lead.industry.toLowerCase()} businesses in ${lead.city}, and ${lead.businessName} stood out as a strong vehicle branding opportunity.`
        : `I'm reaching out because ${lead.businessName} could significantly increase local visibility with professional vehicle branding.`;

  const valueProp =
    VALUE_PROPS[lead.industry] ??
    "Professional vehicle wraps turn your vehicles into a 24/7 advertising channel across every route and job site.";

  return `Subject: Vehicle Branding for ${lead.businessName} — Free Vehicle Branding Assessment

Dear ${lead.businessName} Team,

${openingLine}

At ${LEADLENS_BRAND.name}, we specialize in vehicle branding intelligence for ${lead.industry.toLowerCase()} businesses. ${valueProp}

Based on our initial Vehicle Branding Audit, these are the areas worth reviewing:

• ${lead.recommendedServices[0]}
• ${lead.recommendedServices[1] || "Vehicle branding consultation"}
• ${lead.recommendedServices[2] || "Van graphics refresh"}

We would be happy to share the evidence behind this recommendation and offer a complimentary vehicle branding assessment for your vehicles operating around ${lead.location}, ${lead.city}.

Would you be available for a brief 15-minute call next week? I can share before/after examples from similar vehicles we've wrapped in the region.

Best regards,

${LEADLENS_BRAND.senderLabel}
${LEADLENS_BRAND.tagline}
📞 ${LEADLENS_BRAND.phone}
✉️ ${LEADLENS_BRAND.email}

P.S. We can also send the source notes behind this recommendation before scheduling a call.`;
}
