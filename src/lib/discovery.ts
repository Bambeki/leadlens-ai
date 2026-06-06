import type { DiscoverySource } from "./types";

interface DiscoveryInput {
  id: string;
  businessName: string;
  industry: string;
  city: string;
}

function hash(id: string, salt: number): number {
  return id.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + salt), salt);
}

const industryCategories: Record<string, string[]> = {
  "Construction Companies": ["Construction company", "Contractor", "Builder"],
  Electricians: ["Electrician", "Electrical contractor", "Electrical services"],
  Plumbers: ["Plumber", "Plumbing contractor", "Plumbing services"],
  "Delivery Services": ["Delivery service", "Courier", "Last-mile delivery"],
  "Landscaping Businesses": ["Landscaping", "Lawn care", "Garden services"],
  "Logistics Companies": ["Logistics", "Freight", "Transport company"],
};

const collectionDates = [
  "2026-05-28",
  "2026-05-29",
  "2026-05-30",
  "2026-05-31",
  "2026-06-01",
  "2026-06-02",
  "2026-06-03",
  "2026-06-04",
];

export function generateDiscoverySource(lead: DiscoveryInput): DiscoverySource {
  const h = hash(lead.id, 1);
  const rating = 3.8 + (h % 12) / 10;
  const reviewCount = 8 + (h % 180);

  return {
    platform: "Google Maps",
    collectedAt: collectionDates[h % collectionDates.length],
    placeId: `ChIJ${lead.id.padStart(4, "0")}${slugify(lead.city).slice(0, 8)}`,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    categories: industryCategories[lead.industry] ?? [lead.industry],
    method: "Automated regional scan — 25 km radius",
  };
}

function slugify(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}
