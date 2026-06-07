import Link from "next/link";
import LandingHero from "@/components/LandingHero";
import { DemoModeButton } from "@/components/DemoMode";

function MockDashboard() {
  return (
    <div className="overflow-hidden rounded-xl border border-saas-border bg-saas-card shadow-2xl">
      <div className="flex items-center gap-2 border-b border-saas-border bg-white/5 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="mx-auto rounded-md bg-saas-card px-3 py-0.5 text-xs text-slate-500">
          leadlens.ai/dashboard
        </div>
      </div>
      <div className="flex">
        <div className="w-16 border-r border-saas-border bg-saas-card p-3">
          <div className="mb-4 h-6 w-6 rounded-md bg-violet-600" />
          <div className="space-y-2">
            <div className="h-4 rounded bg-violet-500/15" />
            <div className="h-4 rounded bg-white/10" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="mb-4 grid grid-cols-4 gap-2">
            {["5", "4", "3", "2"].map((val, i) => (
              <div
                key={val}
                className="rounded-lg border border-saas-border p-2"
              >
                <div className="h-2 w-8 rounded bg-white/10" />
                <div
                  className={`mt-1 text-lg font-bold ${
                    i === 0
                      ? "text-violet-400"
                      : i === 1
                        ? "text-red-500"
                        : i === 2
                          ? "text-amber-500"
                          : "text-emerald-500"
                  }`}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-saas-border">
            <div className="border-b border-saas-border bg-white/5 px-3 py-2">
              <div className="h-2.5 w-16 rounded bg-white/15" />
            </div>
            {[85, 72, 65, 58, 45].map((score) => (
              <div
                key={score}
                className="flex items-center gap-2 border-b border-saas-border px-3 py-2 last:border-0"
              >
                <div className="h-2 w-20 rounded bg-white/10" />
                <div className="h-2 w-12 rounded bg-white/10" />
                <div className="ml-auto flex items-center gap-1">
                  <div className="h-1.5 w-10 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        score >= 70
                          ? "bg-red-400"
                          : score >= 40
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-300">
                    {score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockAnalyzer() {
  return (
    <div className="overflow-hidden rounded-xl border border-saas-border bg-saas-card shadow-2xl">
      <div className="flex items-center gap-2 border-b border-saas-border bg-white/5 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="mx-auto rounded-md bg-saas-card px-3 py-0.5 text-xs text-slate-500">
          leadlens.ai/analyzer
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 h-24 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-saas-border p-3">
            <div className="text-xs text-slate-500">Vehicle Visibility</div>
            <div className="mt-1 text-2xl font-bold text-red-500">58</div>
          </div>
          <div className="rounded-lg border border-saas-border p-3">
            <div className="text-xs text-slate-500">Opportunity</div>
            <div className="mt-1 text-2xl font-bold text-violet-400">
              €3,500
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const benefits = [
  {
    title: "Smart Lead Scoring",
    description:
      "Prioritize construction, trades, delivery, landscaping, and logistics companies with AI vehicle branding scores.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: "AI Outreach Emails",
    description:
      "Generate personalized outreach emails tailored to each prospect's industry, location, and lead score.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: "Vehicle Branding Audit",
    description:
      "Upload vehicle photos and get instant visibility scores, wrap gap detection, and project value estimates.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
      </svg>
    ),
  },
  {
    title: "Wrap Recommendations",
    description:
      "Get tailored vehicle branding suggestions — full wraps, partial wraps, vehicle branding, truck and van graphics.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-saas-bg">
      <header className="border-b border-saas-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">LeadLens AI</span>
          </div>
          <div className="flex items-center gap-3">
            <DemoModeButton variant="primary" />
            <Link
              href="/dashboard"
              className="rounded-lg border border-saas-border px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      <LandingHero />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-violet-400">
              Lead Dashboard
            </p>
            <MockDashboard />
          </div>
          <div className="lg:mt-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-violet-400">
              Vehicle Branding Audit
            </p>
            <MockAnalyzer />
          </div>
        </div>
      </section>

      <section className="border-t border-saas-border bg-white/5 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Everything your sales team needs
            </h2>
            <p className="mt-3 text-lg text-slate-300">
              From discovery to outreach — powered by AI, built for vehicle
              branding professionals.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-saas-border bg-saas-card p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                  {benefit.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 leading-relaxed text-slate-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to find your next big client?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Explore pre-qualified vehicle branding leads, generate outreach emails, and
            run vehicle branding audits — all in one demo.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <DemoModeButton variant="hero" />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-violet-500"
            >
              Get Started — It&apos;s Free
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-saas-border bg-saas-card py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              © 2026 LeadLens AI
            </p>
            <p className="text-sm text-slate-500">
              Built for vehicle wrap & vehicle branding companies
            </p>
          </div>
          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
            Inspired by real-world vehicle branding businesses such as Weimar
            Beschriftung.
          </p>
        </div>
      </footer>
    </div>
  );
}
