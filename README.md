# LeadLens AI

Customer Opportunity Discovery Platform for vehicle branding companies.

## Features

- **Customer Opportunity Dashboard** — Review imported customer opportunities and analysis status
- **Opportunity Details** — Score breakdown, source evidence, contact context, and recommended next steps
- **Evidence & Sources** — Show source names, source types, URLs, evidence summaries, collection dates, and confidence scores
- **AI Outreach Generator** — Prepare personalized outreach for each customer opportunity
- **Vehicle Branding Audit** — Review image-based vehicle branding signals
- **Landing Page** — Product positioning, key features, and pilot-ready calls to action

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

## Opportunity Scoring Model

| Factor | Points |
|--------|--------|
| Recently Opened | 25 |
| Active Social Media | 20 |
| Multiple Locations | 20 |
| Branding Opportunity | 20 |
| Regional Proximity | 15 |
| **Total** | **100** |

Priority: High (70+), Medium (40-69), Low (&lt;40)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   └── (app)/
│       ├── dashboard/        # Customer opportunity dashboard
│       ├── leads/[id]/       # Opportunity detail page
│       └── analyzer/         # Vehicle branding audit
├── components/               # UI components
└── lib/
    ├── base-data.ts          # Empty baseline data until customers are imported
    ├── scoring.ts            # Scoring model
    ├── outreach.ts           # Email generator
    └── analyzer.ts           # Vehicle branding analysis helpers
```

Customer records are imported by the user and stored locally until a database is connected.

