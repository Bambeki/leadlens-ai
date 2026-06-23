"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationCenter from "./NotificationCenter";

const PAGE_TITLES: Record<string, string> = {
  "/pipeline": "Opportunity Pipeline",
  "/dashboard": "Customer Opportunity Dashboard",
  "/meetings": "Meetings",
  "/email-center": "Email Center",
  "/roi-calculator": "ROI Calculator",
  "/lead-import": "Customer Import",
  "/data-sources": "Data Sources",
  "/analyzer": "Vehicle Branding Audit",
};

const MOBILE_NAV = [
  { href: "/pipeline", label: "Pipeline" },
  { href: "/lead-import", label: "Import" },
  { href: "/dashboard", label: "Opportunities" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/leads/") ? "Opportunity Details" : "LeadLens AI");

  return (
    <>
      <header className="saas-glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-saas-border px-4 sm:px-8">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20 sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
          <NotificationCenter />
        </div>
      </header>
      <nav className="flex border-b border-saas-border bg-saas-card md:hidden">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "border-b-2 border-violet-500 text-violet-400"
                : "text-slate-500"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
