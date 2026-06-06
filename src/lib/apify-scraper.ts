import type { ScrapedBusiness } from "./types";
import { inferIndustry, buildLeadFromScraped } from "./build-lead";

export interface ScrapeParams {
  searchTerm: string;
  city: string;
  radiusKm?: number;
}

export interface DiscoveryParams {
  city: string;
  radiusKm: number;
  searchTerms: string[];
  keyword?: string;
}

export interface ScoredScrapedBusiness extends ScrapedBusiness {
  score: number;
  priority: "High" | "Medium" | "Low";
}

export const DEFAULT_SIGNAGE_SEARCHES = [
  { id: "construction", label: "Construction Companies", term: "construction companies" },
  { id: "electricians", label: "Electricians", term: "electricians" },
  { id: "plumbers", label: "Plumbers", term: "plumbers" },
  { id: "delivery", label: "Delivery Services", term: "delivery services" },
  { id: "landscaping", label: "Landscaping Businesses", term: "landscaping businesses" },
  { id: "logistics", label: "Logistics Companies", term: "logistics companies" },
] as const;

export const RADIUS_OPTIONS = [5, 10, 25, 50] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS)[number];

const EXAMPLE_DATA: Record<string, ScrapedBusiness[]> = {
  "electricians-giessen": [
    { id: "imp-g1", businessName: "Elektro Weber Giessen", rating: 4.6, reviewCount: 84, website: "www.elektroweber-giessen.de", phone: "+49 641 92 3456", address: "Industriestraße 12", city: "Giessen", searchTerm: "Electricians", category: "Electrician" },
    { id: "imp-g2", businessName: "Strom & Sicher Elektrotechnik", rating: 4.7, reviewCount: 41, website: "www.stromsicher-giessen.de", phone: "+49 641 55 7890", address: "Bahnhofstraße 8", city: "Giessen", searchTerm: "Electricians", category: "Electrical contractor" },
    { id: "imp-g3", businessName: "Licht & Leitung GmbH", rating: 4.4, reviewCount: 62, website: "www.lichtleitung.de", phone: "+49 641 33 2100", address: "Hauptstraße 45", city: "Giessen", searchTerm: "Electricians", category: "Electrician" },
    { id: "imp-g4", businessName: "Elektro Schmidt Service", rating: 4.2, reviewCount: 28, website: "", phone: "+49 641 44 5566", address: "Marktplatz 3", city: "Giessen", searchTerm: "Electricians", category: "Electrical services" },
    { id: "imp-g5", businessName: "PowerLine Elektro Giessen", rating: 4.5, reviewCount: 97, website: "www.powerline-giessen.de", phone: "+49 641 77 8899", address: "Karlstraße 19", city: "Giessen", searchTerm: "Electricians", category: "Electrician" },
    { id: "imp-g6", businessName: "Voltwerk Elektrotechnik", rating: 4.3, reviewCount: 55, website: "www.voltwerk-giessen.de", phone: "+49 641 22 3344", address: "Neustadt 27", city: "Giessen", searchTerm: "Electricians", category: "Electrical contractor" },
  ],
  "construction-marburg": [
    { id: "imp-m1", businessName: "BauPro Marburg GmbH", rating: 4.5, reviewCount: 112, website: "www.baupromarburg.de", phone: "+49 6421 90 100", address: "Industriepark 26", city: "Marburg", searchTerm: "Construction Companies", category: "Construction company" },
    { id: "imp-m2", businessName: "Lahn Bau & Tiefbau", rating: 4.6, reviewCount: 78, website: "www.lahnbau.de", phone: "+49 6421 30 60", address: "Jahnstraße 12", city: "Marburg", searchTerm: "Construction Companies", category: "Contractor" },
    { id: "imp-m3", businessName: "Hessen Hochbau", rating: 4.2, reviewCount: 45, website: "www.hessenhochbau.de", phone: "+49 6421 15 880", address: "Domplatz 5", city: "Marburg", searchTerm: "Construction Companies", category: "Builder" },
    { id: "imp-m4", businessName: "Marburg Bau Service", rating: 4.0, reviewCount: 33, website: "", phone: "+49 6421 44 2200", address: "Reitgasse 8", city: "Marburg", searchTerm: "Construction Companies", category: "Construction company" },
    { id: "imp-m5", businessName: "SolidBuild Marburg", rating: 4.4, reviewCount: 89, website: "www.solidbuild-marburg.de", phone: "+49 6421 80 950", address: "Alsfelder Straße 3", city: "Marburg", searchTerm: "Construction Companies", category: "Contractor" },
  ],
  "plumbers-wetzlar": [
    { id: "imp-w1", businessName: "Sanitär König Wetzlar", rating: 4.6, reviewCount: 67, website: "www.sanitaerkoenig-wetzlar.de", phone: "+49 6441 50 6000", address: "Berliner Straße 55", city: "Wetzlar", searchTerm: "Plumbers", category: "Plumber" },
    { id: "imp-w2", businessName: "Rohr & Wasser GmbH", rating: 4.3, reviewCount: 52, website: "www.rohrwasser-wetzlar.de", phone: "+49 6441 33 7700", address: "Hermannsteiner Weg 4", city: "Wetzlar", searchTerm: "Plumbers", category: "Plumbing contractor" },
    { id: "imp-w3", businessName: "AquaFix Sanitär Service", rating: 4.8, reviewCount: 38, website: "www.aquafix-wetzlar.de", phone: "+49 6441 99 1234", address: "Münze 14", city: "Wetzlar", searchTerm: "Plumbers", category: "Plumbing services" },
    { id: "imp-w4", businessName: "Lahn Sanitärtechnik", rating: 4.5, reviewCount: 71, website: "www.lahnsanitaer.de", phone: "+49 6441 22 8899", address: "Karl-Kellner-Ring 9", city: "Wetzlar", searchTerm: "Plumbers", category: "Plumber" },
    { id: "imp-w5", businessName: "PipePro Wetzlar", rating: 4.1, reviewCount: 29, website: "", phone: "+49 6441 77 4455", address: "Lindenstraße 21", city: "Wetzlar", searchTerm: "Plumbers", category: "Plumbing contractor" },
    { id: "imp-w6", businessName: "WasserWerk Sanitär", rating: 4.4, reviewCount: 44, website: "www.wasserwerk-wetzlar.de", phone: "+49 6441 11 6677", address: "Dillstraße 33", city: "Wetzlar", searchTerm: "Plumbers", category: "Plumber" },
  ],
};

const NAME_PREFIXES = ["Alpine", "City", "Central", "Golden", "Metro", "Rhein", "Lahn", "Hessen"];
const NAME_SUFFIXES = ["Haus", "Center", "Plus", "Premium", "Express", "Studio", "GmbH", "Lounge"];

function lookupKey(term: string, city: string): string | null {
  const t = term.toLowerCase().trim();
  const c = city.toLowerCase().trim();
  if ((t.includes("electric") || t === "electricians") && c.includes("giessen")) return "electricians-giessen";
  if ((t.includes("construction") || t.includes("contractor")) && c.includes("marburg")) return "construction-marburg";
  if ((t.includes("plumb") || t === "plumbers") && c.includes("wetzlar")) return "plumbers-wetzlar";
  return null;
}

function resultsPerSearch(radiusKm: number): number {
  if (radiusKm <= 5) return 3;
  if (radiusKm <= 10) return 4;
  if (radiusKm <= 25) return 5;
  return 6;
}

function generateGeneric(
  searchTerm: string,
  city: string,
  count: number,
  indexOffset = 0
): ScrapedBusiness[] {
  const industry = inferIndustry(searchTerm);
  const h = (searchTerm + city).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const results: ScrapedBusiness[] = [];

  for (let i = 0; i < count; i++) {
    const idx = indexOffset + i;
    const prefix = NAME_PREFIXES[(h + idx) % NAME_PREFIXES.length];
    const suffix = NAME_SUFFIXES[(h + idx * 2) % NAME_SUFFIXES.length];
    const rating = Math.round((3.5 + ((h + idx) % 15) / 10) * 10) / 10;
    const reviews = 12 + ((h + idx * 3) % 200);
    const slug = `${prefix}${suffix}`.toLowerCase().replace(/\s/g, "");
    const termSlug = searchTerm.toLowerCase().replace(/\s/g, "").slice(0, 8);

    results.push({
      id: `imp-${city.toLowerCase().replace(/\s/g, "").slice(0, 6)}-${termSlug}-${h}-${idx}`,
      businessName: `${prefix} ${searchTerm} ${suffix}`,
      rating,
      reviewCount: reviews,
      website: reviews > 50 ? `www.${slug}-${city.toLowerCase()}.de` : "",
      phone: `+49 ${600 + (h % 100)} ${10 + idx} ${1000 + (h + idx) % 9000}`,
      address: `${["Hauptstraße", "Bahnhofstraße", "Marktplatz", "Industriestraße"][(h + idx) % 4]} ${10 + idx * 3}`,
      city,
      searchTerm,
      category: industry,
    });
  }
  return results;
}

export async function runApifyScraper(params: ScrapeParams): Promise<ScrapedBusiness[]> {
  const { searchTerm, city, radiusKm = 10 } = params;

  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

  const key = lookupKey(searchTerm, city);
  if (key && EXAMPLE_DATA[key]) {
    const data = EXAMPLE_DATA[key].map((b) => ({
      ...b,
      searchTerm,
      city,
    }));
    return data.slice(0, resultsPerSearch(radiusKm));
  }

  return generateGeneric(
    searchTerm,
    city,
    resultsPerSearch(radiusKm) + (hashStr(searchTerm + city) % 2),
    hashStr(searchTerm) % 10
  );
}

function dedupeBusinesses(businesses: ScrapedBusiness[]): ScrapedBusiness[] {
  const seen = new Map<string, ScrapedBusiness>();

  for (const b of businesses) {
    const key = `${b.businessName.toLowerCase().trim()}-${b.city.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.set(key, b);
    }
  }

  return Array.from(seen.values());
}

function scoreAndSort(businesses: ScrapedBusiness[]): ScoredScrapedBusiness[] {
  return businesses
    .map((b) => {
      const lead = buildLeadFromScraped(b);
      return {
        ...b,
        score: lead.scoreBreakdown.total,
        priority: lead.priority,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function runDiscovery(
  params: DiscoveryParams
): Promise<ScoredScrapedBusiness[]> {
  const { city, radiusKm, searchTerms, keyword } = params;

  const terms = keyword?.trim()
    ? [keyword.trim()]
    : searchTerms.length > 0
      ? searchTerms
      : DEFAULT_SIGNAGE_SEARCHES.map((s) => s.term);

  const allResults: ScrapedBusiness[] = [];

  for (const term of terms) {
    const batch = await runApifyScraper({
      searchTerm: term,
      city,
      radiusKm,
    });
    allResults.push(...batch);
  }

  const unique = dedupeBusinesses(allResults);
  return scoreAndSort(unique);
}

function hashStr(s: string): number {
  return s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

export const SCRAPE_EXAMPLES = [
  { searchTerm: "Electricians", city: "Giessen" },
  { searchTerm: "Construction Companies", city: "Marburg" },
  { searchTerm: "Plumbers", city: "Wetzlar" },
];
