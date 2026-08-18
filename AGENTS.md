<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

LeadLens AI is a single Next.js 16 (App Router) + TypeScript + Prisma app. Standard commands live in `package.json` (`dev`, `build`, `lint`, `db:migrate`, `db:generate`). The only backing service is PostgreSQL.

Non-obvious startup caveats:

- PostgreSQL is required for all `/api/*` persistence and for `db:migrate`, but it is NOT auto-started on a fresh VM boot. Start it each session with `sudo pg_ctlcluster 16 main start`. Local DB used during setup: database `leadlens`, role `postgres`/`postgres` on `localhost:5432`.
- The app reads `DATABASE_URL` (and optional `DIRECT_URL`) from a git-ignored `.env`. If `.env` is missing, recreate it with `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadlens?schema=public"` and the same value for `DIRECT_URL`, then run `npm run db:migrate` to apply the schema. The pilot org/user/company profile self-seeds on first API call, so no manual seed is needed.
- The dashboard/UI degrades gracefully: `useAllLeads` falls back to `localStorage` when `/api/opportunities` fails. A populated dashboard therefore does NOT prove the DB works — verify persistence via `GET /api/opportunities` or by querying the `Opportunity` table.
- Lead discovery (`src/lib/apify-scraper.ts`) is fully mocked, so the `/lead-import` wizard works end-to-end with no external API. `APIFY_TOKEN`/`APIFY_GOOGLE_MAPS_ACTOR` only toggle a badge on `/system-status`.
- Email is optional: `RESEND_API_KEY` + `RESEND_FROM_EMAIL` enable real sending via Resend; without them `/api/send-email` returns 503 while the rest of the app (including outreach generation/preview) works.
- No automated test runner is configured (no `test` script); "tests" here means `npm run lint` and `npm run build`.
