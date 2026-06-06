"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationCenter from "./NotificationCenter";

const PAGE_TITLES: Record<string, string> = {
  "/pipeline": "Acquisition Pipeline",
  "/dashboard": "Lead Dashboard",
  "/data-sources": "Data Sources",
  "/meetings": "Meetings",
  "/email-center": "Email Center",
  "/roi-calculator": "ROI Calculator",
  "/system-status": "System Status",
  "/lead-import": "Lead Import",
  "/analyzer": "Fleet Branding Analyzer",
};

const MOBILE_NAV = [
  { href: "/pipeline", label: "Pipeline" },
  { href: "/lead-import", label: "Import" },
  { href: "/dashboard", label: "Leads" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/leads/") ? "Lead Details" : "LeadLens AI");

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-8">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Demo Mode
          </span>
          <NotificationCenter />
        </div>
      </header>
      <nav className="flex border-b border-slate-200 bg-white md:hidden">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "border-b-2 border-indigo-600 text-indigo-600"
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
