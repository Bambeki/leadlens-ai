"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScrapedBusiness } from "@/lib/types";
import {
  runDiscovery,
  DEFAULT_SIGNAGE_SEARCHES,
  RADIUS_OPTIONS,
  SCRAPE_EXAMPLES,
  type ScoredScrapedBusiness,
  type RadiusKm,
} from "@/lib/apify-scraper";
import {
  requestUserLocation,
  type DetectedLocation,
} from "@/lib/location-detection";
import { importBusinessesToPipeline, getImportSessions } from "@/lib/imported-leads";
import type { ImportSession } from "@/lib/types";
import { createNotification } from "@/lib/notifications";
import PriorityBadge from "./PriorityBadge";
import Button from "./ui/Button";

type WizardStep =
  | "location"
  | "types"
  | "discover"
  | "scraping"
  | "review"
  | "imported";

const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: "location", label: "1. Choose location" },
  { id: "types", label: "2. Select business types" },
  { id: "discover", label: "3. Discover leads" },
  { id: "review", label: "4. Import to pipeline" },
];

function stepIndex(step: WizardStep): number {
  if (step === "scraping") return 2;
  if (step === "imported") return 3;
  const map: Record<string, number> = {
    location: 0,
    types: 1,
    discover: 2,
    review: 3,
  };
  return map[step] ?? 0;
}

export default function LeadImport() {
  const [step, setStep] = useState<WizardStep>("location");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    () => new Set(DEFAULT_SIGNAGE_SEARCHES.map((s) => s.id))
  );
  const [advancedMode, setAdvancedMode] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [radiusKm, setRadiusKm] = useState<RadiusKm>(10);
  const [results, setResults] = useState<ScoredScrapedBusiness[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchLabel, setSearchLabel] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState("");
  const [scrapeProgress, setScrapeProgress] = useState("");
  const [sessions, setSessions] = useState<ImportSession[]>([]);

  useEffect(() => {
    setSessions(getImportSessions());
  }, [step, importedCount]);

  async function handleUseLocation() {
    setDetectingLocation(true);
    setLocationError("");
    const result = await requestUserLocation();
    setDetectingLocation(false);

    if (!result.ok) {
      setLocationError(result.error);
      return;
    }

    applyDetectedLocation(result.location);
  }

  function applyDetectedLocation(loc: DetectedLocation) {
    setCity(loc.city);
    setRegion(loc.region);
    setCoords({ lat: loc.latitude, lng: loc.longitude });
    setLocationError("");
  }

  function applyExample(ex: { searchTerm: string; city: string }) {
    setAdvancedMode(true);
    setKeyword(ex.searchTerm);
    setCity(ex.city);
    setRegion("Hesse");
    setCoords(null);
    setLocationError("");
    setStep("types");
  }

  function toggleType(id: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllTypes() {
    if (selectedTypes.size === DEFAULT_SIGNAGE_SEARCHES.length) {
      setSelectedTypes(new Set());
    } else {
      setSelectedTypes(new Set(DEFAULT_SIGNAGE_SEARCHES.map((s) => s.id)));
    }
  }

  function getSearchTerms(): string[] {
    if (advancedMode && keyword.trim()) {
      return [keyword.trim()];
    }
    return DEFAULT_SIGNAGE_SEARCHES.filter((s) => selectedTypes.has(s.id)).map(
      (s) => s.term
    );
  }

  function getSearchLabel(): string {
    if (advancedMode && keyword.trim()) {
      return `"${keyword.trim()}"`;
    }
    const count = selectedTypes.size;
    return `${count} business type${count === 1 ? "" : "s"}`;
  }

  async function handleDiscover() {
    if (!city.trim()) {
      setError("Please enter or detect a city first.");
      return;
    }

    const terms = getSearchTerms();
    if (terms.length === 0) {
      setError("Select at least one business type, or enter a keyword in Advanced Mode.");
      return;
    }

    setError("");
    setStep("scraping");
    setScrapeProgress(
      advancedMode && keyword.trim()
        ? `Searching for "${keyword.trim()}" near ${city}…`
        : `Running ${terms.length} searches within ${radiusKm} km of ${city}…`
    );

    try {
      const data = await runDiscovery({
        city: city.trim(),
        radiusKm,
        searchTerms: terms,
        keyword: advancedMode && keyword.trim() ? keyword.trim() : undefined,
      });

      setResults(data);
      setSelected(new Set(data.map((r) => r.id)));
      setSearchLabel(getSearchLabel());
      setStep("review");
    } catch {
      setError("Discovery failed. Please try again.");
      setStep("discover");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((r) => r.id)));
    }
  }

  function handleImport() {
    const toImport = results.filter((r) => selected.has(r.id)) as ScrapedBusiness[];
    const label =
      advancedMode && keyword.trim() ? keyword.trim() : "Multi-category discovery";
    const imported = importBusinessesToPipeline(toImport, label, city);
    setImportedCount(imported.length);
    setStep("imported");

    window.dispatchEvent(
      new CustomEvent("leadlens-notification", {
        detail: createNotification(
          "crm_updated",
          `${imported.length} businesses imported to pipeline from ${city}.`
        ),
      })
    );
    window.dispatchEvent(new CustomEvent("leadlens-leads-updated"));
  }

  function resetWizard() {
    setStep("location");
    setResults([]);
    setKeyword("");
    setAdvancedMode(false);
    setError("");
    setSearchLabel("");
  }

  const currentIdx = stepIndex(step);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex flex-wrap items-center gap-2">
        {WIZARD_STEPS.map((s, i) => {
          const thisIdx = i;
          const isActive =
            step === s.id ||
            (step === "scraping" && s.id === "discover") ||
            (step === "imported" && s.id === "review");
          const isDone = thisIdx < currentIdx || step === "imported";
          return (
            <div key={s.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isDone && step !== "scraping") {
                    setStep(s.id as WizardStep);
                  }
                }}
                disabled={!isDone || step === "scraping"}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-violet-600 text-white"
                    : isDone
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-white/10 text-slate-500"
                } ${isDone && step !== "scraping" ? "cursor-pointer" : "cursor-default"}`}
              >
                {isDone && !isActive && "✓ "}
                {s.label}
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <svg className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Location */}
      {step === "location" && (
        <div className="rounded-2xl border border-saas-border bg-saas-card p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-white">Choose your location</h2>
          <p className="mt-1 text-sm text-slate-500">
            Detect your city automatically or enter it manually
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleUseLocation} disabled={detectingLocation}>
              {detectingLocation ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Detecting location…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Use My Location
                </>
              )}
            </Button>
          </div>

          {locationError && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {locationError}
            </div>
          )}

          {(city || coords) && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Detected location
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {city}
                {region && (
                  <span className="ml-2 text-base font-normal text-slate-300">
                    · {region}
                  </span>
                )}
              </p>
              {coords && (
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
                </p>
              )}
            </div>
          )}

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-300">
              City / region (manual entry)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setLocationError("");
              }}
              placeholder="e.g. Giessen, Marburg, Wetzlar"
              className="saas-input mt-1.5 w-full px-4 py-2.5 text-sm"
            />
          </div>

          <div className="mt-6">
            <Button onClick={() => setStep("types")} disabled={!city.trim()}>
              Continue to business types →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Business types */}
      {step === "types" && (
        <div className="rounded-2xl border border-saas-border bg-saas-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Select business types
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                High-value fleet branding prospects near {city || "your location"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                advancedMode
                  ? "bg-violet-500/15 text-indigo-700"
                  : "bg-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              {advancedMode ? "Advanced Mode ON" : "Advanced Mode"}
            </button>
          </div>

          {advancedMode ? (
            <div className="mt-6">
              <label className="text-sm font-medium text-slate-300">
                Keyword (optional — overrides category selection)
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. electricians, plumbers, construction companies"
                className="mt-1.5 w-full rounded-lg border border-saas-border bg-white/5 px-4 py-2.5 text-sm focus:border-indigo-300 focus:bg-saas-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="mt-2 text-xs text-slate-500">
                Example: Keyword <strong>electricians</strong> · City <strong>Giessen</strong>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SCRAPE_EXAMPLES.map((ex) => (
                  <button
                    key={`${ex.searchTerm}-${ex.city}`}
                    onClick={() => applyExample(ex)}
                    className="rounded-full border border-saas-border bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-violet-500/20 hover:bg-white/5 hover:text-violet-400"
                  >
                    {ex.searchTerm} in {ex.city}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">
                  Default high-value searches
                </p>
                <button
                  type="button"
                  onClick={toggleAllTypes}
                  className="text-xs font-semibold text-violet-400 hover:text-indigo-800"
                >
                  {selectedTypes.size === DEFAULT_SIGNAGE_SEARCHES.length
                    ? "Deselect all"
                    : "Select all"}
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {DEFAULT_SIGNAGE_SEARCHES.map((type) => (
                  <label
                    key={type.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      selectedTypes.has(type.id)
                        ? "border-violet-500/20 bg-violet-500/10"
                        : "border-saas-border bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.has(type.id)}
                      onChange={() => toggleType(type.id)}
                      className="rounded border-slate-300 text-violet-400"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Leave keyword empty to run all selected categories automatically.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => setStep("location")}>
              ← Back
            </Button>
            <Button
              onClick={() => {
                setError("");
                setStep("discover");
              }}
              disabled={
                advancedMode
                  ? false
                  : selectedTypes.size === 0
              }
            >
              Continue to discovery →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Discover */}
      {(step === "discover" || step === "scraping") && (
        <div className="rounded-2xl border border-saas-border bg-saas-card p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-white">Discover leads</h2>
          <p className="mt-1 text-sm text-slate-500">
            Search within a radius of {city}
            {advancedMode && keyword.trim()
              ? ` for "${keyword.trim()}"`
              : ` across ${selectedTypes.size} business types`}
          </p>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-300">Search radius</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  disabled={step === "scraping"}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    radiusKm === r
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-white/10 text-slate-300 hover:bg-white/10"
                  } disabled:opacity-50`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="mt-8 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 text-center">
            <p className="text-sm text-slate-300">
              One click runs multiple Google Maps searches, removes duplicates,
              scores every business, and ranks the best leads first.
            </p>
            <div className="mt-5">
              <Button
                size="lg"
                onClick={handleDiscover}
                disabled={step === "scraping"}
              >
                {step === "scraping" ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Discovering leads…
                  </>
                ) : (
                  "Find B2B Leads Near Me"
                )}
              </Button>
            </div>
          </div>

          {step === "scraping" && (
            <div className="mt-6 rounded-lg border border-violet-500/20 bg-violet-500/10 p-4">
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-violet-500" />
                </div>
                <span className="text-xs font-medium text-violet-400">
                  {scrapeProgress}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={() => setStep("types")}
              disabled={step === "scraping"}
            >
              ← Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & import */}
      {step === "review" && (
        <div className="overflow-hidden rounded-2xl border border-saas-border bg-saas-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-saas-border px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Ranked leads — best first
              </h2>
              <p className="text-sm text-slate-500">
                {results.length} businesses found ({searchLabel}) within {radiusKm} km
                of {city}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setStep("discover")}>
                New Search
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={selected.size === 0}
              >
                Import {selected.size} to Pipeline
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-saas-border bg-white/5">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === results.length && results.length > 0}
                      onChange={toggleAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-300">Score</th>
                  <th className="px-4 py-3 font-semibold text-slate-300">Business</th>
                  <th className="px-4 py-3 font-semibold text-slate-300">Rating</th>
                  <th className="px-4 py-3 font-semibold text-slate-300">Reviews</th>
                  <th className="px-4 py-3 font-semibold text-slate-300">Website</th>
                  <th className="px-4 py-3 font-semibold text-slate-300">Phone</th>
                  <th className="px-4 py-3 font-semibold text-slate-300">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <tr
                    key={r.id}
                    className={`transition-colors ${selected.has(r.id) ? "bg-violet-500/10" : "hover:bg-white/5"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-violet-400">
                          {r.score}
                        </span>
                        <PriorityBadge priority={r.priority} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{r.businessName}</p>
                      <p className="text-xs text-slate-500">{r.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-amber-600">{r.rating} ★</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.reviewCount}</td>
                    <td className="px-4 py-3">
                      {r.website ? (
                        <span className="text-violet-400">{r.website}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.phone}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {r.address}, {r.city}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success */}
      {step === "imported" && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-7.5" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {importedCount} Leads Imported
          </h2>
          <p className="mt-2 text-slate-300">
            Businesses from {searchLabel} near {city} are now in your LeadLens
            pipeline — scored, enriched, and ready for outreach.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard">
              <Button>View in Dashboard</Button>
            </Link>
            <Link href="/pipeline">
              <Button variant="secondary">Open Pipeline</Button>
            </Link>
            <Button variant="ghost" onClick={resetWizard}>
              Import More
            </Button>
          </div>
        </div>
      )}

      {/* Import history */}
      {sessions.length > 0 && (step === "location" || step === "types") && (
        <div className="rounded-xl border border-saas-border bg-saas-card p-6 shadow-sm">
          <h3 className="font-semibold text-white">Recent Imports</h3>
          <ul className="mt-3 space-y-2">
            {sessions.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2 text-sm"
              >
                <span className="text-slate-300">
                  {s.searchTerm} in {s.city}
                </span>
                <span className="text-slate-500">
                  {s.importedCount} imported ·{" "}
                  {new Date(s.scrapedAt).toLocaleDateString("en-GB")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
