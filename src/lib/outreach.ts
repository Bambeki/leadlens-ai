import type { Lead } from "./types";

const VALUE_PROPS: Record<string, string> = {
  "Construction Companies":
    "Branded trucks and vans turn every job site into a mobile billboard — contractors with branded vehicles win 40% more inbound quote requests.",
  Electricians:
    "Professional van graphics build trust before you ring the doorbell — electricians with branded vehicles see higher callback rates on emergency calls.",
  Plumbers:
    "A wrapped service van signals professionalism and stays visible on residential streets long after the job is done.",
  "Delivery Services":
    "Vehicle branding turns every delivery run into thousands of daily brand impressions — essential for local courier differentiation.",
  "Landscaping Businesses":
    "Truck and trailer graphics showcase your work quality on every neighborhood route and job site.",
  "Logistics Companies":
    "Consistent vehicle branding across trucks and trailers reinforces reliability and wins B2B contracts.",
};

export function generateOutreachEmail(lead: Lead, _baseUrl?: string): string {
  const score = lead.scoreBreakdown.total;
  const valueRange = `€${lead.estimatedValue.min.toLocaleString("de-DE")} – €${lead.estimatedValue.max.toLocaleString("de-DE")}`;

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

At FleetBrand Pro, we specialize in vehicle branding intelligence for ${lead.industry.toLowerCase()} businesses. ${valueProp}

Based on our Vehicle Branding Audit, we recommend:

• ${lead.recommendedServices[0]}
• ${lead.recommendedServices[1] || "Vehicle branding consultation"}
• ${lead.recommendedServices[2] || "Van graphics refresh"}

Typical ${lead.industry.toLowerCase()} projects range from ${valueRange}. We'd love to offer a complimentary vehicle branding assessment for your vehicles operating around ${lead.location}, ${lead.city}.

Would you be available for a brief 15-minute call next week? I can share before/after examples from similar vehicles we've wrapped in the region.

Best regards,

Marcus Weber
Senior Account Manager
FleetBrand Pro
📞 +49 89 123 4567
✉️ marcus.weber@fleetbrandpro.de

P.S. — We're offering 10% off first vehicle wraps for companies adding 3+ vehicles this quarter.`;
}
