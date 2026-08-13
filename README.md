# LeadLens AI

Lead intelligence and sales workflow platform for discovering, evaluating and managing business opportunities.

LeadLens AI is intended as a broader intelligent lead discovery, qualification, outreach, and CRM workflow platform. The product vision is to help businesses discover potential leads, organize relevant lead information, analyze opportunities, score and prioritize prospects, prepare personalized outreach, track communication and responses, manage meetings, and move opportunities through a sales pipeline.

## Current Prototype Use Case

The current prototype demonstrates LeadLens through branding and vehicle-branding opportunities, providing a focused environment for testing opportunity discovery, analysis, scoring, outreach, and CRM workflows. The underlying product vision extends beyond this initial use case to broader lead-intelligence applications.

## Features

- **Lead Discovery & Import** — Run a prototype discovery flow by city, radius, and business category, then import selected businesses into the opportunity pipeline
- **Opportunity Dashboard** — Review, search, filter, sort, and prioritize imported customer opportunities
- **Opportunity Details** — Inspect score breakdowns, source evidence, contact context, opportunity insights, and recommended next steps
- **Evidence & Source Tracking** — Store source names, source types, URLs, evidence summaries, collection dates, and confidence scores
- **Personalized Outreach Generation** — Generate and save outreach drafts using the configured company profile, with optional OpenAI generation and a deterministic fallback
- **Email Sending & Conversation History** — Send outreach through Resend when configured and track outbound, inbound, and simulated response events
- **CRM Status & Workflow Management** — Move opportunities through CRM stages, record status history, and keep outreach, meeting, and activity state in sync
- **Meeting Workflow** — Suggest meeting times, save scheduled meetings, show upcoming meetings, and update opportunity status when meetings are accepted or scheduled
- **Vehicle-Branding Analysis** — Demonstrate the current specialized use case with prototype image-based vehicle-branding audit outputs

## Tech Stack

- **Next.js 16** with the App Router and API routes
- **React 19** and **TypeScript 5**
- **Tailwind CSS v4** with `@tailwindcss/postcss`
- **Prisma 7** with `@prisma/client` and `@prisma/adapter-pg`
- **PostgreSQL** via the `pg` driver
- **Resend** for configured email delivery
- **OpenAI Chat Completions API** through server-side `fetch` when `OPENAI_API_KEY` is configured, with a local fallback generator
- **ESLint 9** with `eslint-config-next`

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
│       ├── dashboard/        # Opportunity dashboard
│       ├── leads/[id]/       # Opportunity detail page
│       └── analyzer/         # Vehicle branding audit
├── components/               # UI components
└── lib/
    ├── base-data.ts          # Empty baseline data until opportunities are imported
    ├── scoring.ts            # Scoring model
    ├── outreach.ts           # Outreach generator fallback
    └── analyzer.ts           # Vehicle branding analysis helpers
```

Imported records are saved through API routes to PostgreSQL via Prisma, with browser storage used as a prototype fallback/cache for some client-side flows.

