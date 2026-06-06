export const DATA_PIPELINE_STEPS = [
  {
    id: "discover",
    label: "Discover",
    description: "Scrape regional businesses from Google Maps via Apify",
  },
  {
    id: "enrich",
    label: "Enrich",
    description: "Layer website, LinkedIn, social & email data",
  },
  {
    id: "analyze",
    label: "Analyze",
    description: "Vehicle Branding Audit & vehicle opportunity detection",
  },
  {
    id: "score",
    label: "Score",
    description: "Prioritize vehicle branding leads with 100-point scoring model",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Identify decision makers & generate outreach",
  },
  {
    id: "track",
    label: "Track",
    description: "CRM pipeline from first touch to close",
  },
] as const;

export const DATA_SOURCES = [
  {
    id: "google-maps",
    title: "Google Maps / Apify",
    subtitle: "Primary discovery layer",
    accent: "red",
    icon: "maps",
    description:
      "Automated regional business scraping within a configurable radius. Apify actors collect structured place data nightly.",
    fields: [
      "Business name",
      "Address",
      "Website",
      "Phone number",
      "Ratings",
      "Reviews",
      "Category",
    ],
    usedFor: "Lead discovery & qualification",
  },
  {
    id: "website",
    title: "Company Website",
    subtitle: "Deep business intelligence",
    accent: "indigo",
    icon: "website",
    description:
      "AI web crawl extracts contact details, legal pages, and vehicle photos from each discovered business website.",
    fields: [
      "Contact page",
      "Impressum page",
      "Email address",
      "Services",
      "Vehicle photos",
    ],
    usedFor: "Contact discovery & vehicle branding audit",
  },
  {
    id: "linkedin",
    title: "LinkedIn Company Page",
    subtitle: "Decision-maker intelligence",
    accent: "blue",
    icon: "linkedin",
    description:
      "Company page analysis surfaces key stakeholders and growth signals that indicate vehicle branding budget availability.",
    fields: [
      "Decision makers",
      "Owner",
      "Geschäftsführer",
      "Marketing Manager",
      "Operations Manager",
      "Hiring or expansion signals",
    ],
    usedFor: "Contact discovery & timing signals",
  },
  {
    id: "instagram",
    title: "Instagram / Social Media",
    subtitle: "Brand & growth signals",
    accent: "pink",
    icon: "instagram",
    description:
      "Social profile monitoring detects new company vehicles, job-site photos, and unbranded vans from public posts.",
    fields: [
      "Recent posts",
      "Vehicle photos",
      "Job-site vehicles",
      "Branding quality",
    ],
    usedFor: "Opportunity insights & lead scoring",
  },
  {
    id: "email",
    title: "Email Enrichment",
    subtitle: "Verified contact data",
    accent: "violet",
    icon: "email",
    description:
      "Multi-source email verification combines website extraction with professional enrichment APIs.",
    fields: ["Hunter.io", "Apollo", "Website email extraction"],
    usedFor: "Outreach & contact validation",
  },
  {
    id: "street-view",
    title: "Vehicle Vision / Vehicle Images",
    subtitle: "Visual vehicle branding analysis",
    accent: "amber",
    icon: "image",
    description:
      "Computer vision analyzes vehicle imagery to assess wrap opportunities, visibility, and branding gaps.",
    fields: [
      "Vehicle visibility",
      "Wrap quality",
      "Vehicle branding gaps",
    ],
    usedFor: "Vehicle Branding Audit & revenue estimates",
  },
] as const;
