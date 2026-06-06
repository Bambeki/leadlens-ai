# LeadLens AI

AI-powered B2B lead discovery prototype for regional signage companies. Built as a hackathon MVP.

## Features

- **Lead Dashboard** — View 22 pre-qualified B2B leads with scoring and priority
- **Lead Details** — Score breakdown, value reasons, service recommendations, project estimates
- **AI Outreach Generator** — Personalized email generation per lead
- **Storefront Analyzer** — Upload images for mock AI signage analysis
- **Presentation Landing Page** — Product showcase with benefits and CTAs

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or go directly to [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Lead Scoring Model

| Factor | Points |
|--------|--------|
| Recently Opened | 25 |
| Active Social Media | 20 |
| Multiple Locations | 20 |
| Branding Opportunity | 20 |
| Regional Proximity | 15 |
| **Total** | **100** |

Priority: High (70+), Medium (40–69), Low (&lt;40)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing / presentation mode
│   └── (app)/
│       ├── dashboard/        # Lead dashboard
│       ├── leads/[id]/       # Lead detail page
│       └── analyzer/         # Storefront analyzer
├── components/               # UI components
└── lib/
    ├── mock-data.ts          # 22 demo leads
    ├── scoring.ts            # Scoring model
    ├── outreach.ts           # Email generator
    └── analyzer.ts           # Mock storefront analysis
```

No external APIs required — all data and AI features use local mock logic.

