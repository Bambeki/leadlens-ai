"use client";

import { useState, useRef } from "react";
import { analyzeStorefront } from "@/lib/analyzer";
import type { StorefrontAnalysis } from "@/lib/types";
import { formatCurrency } from "@/lib/scoring";

export default function StorefrontAnalyzer() {
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<StorefrontAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setAnalysis(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleAnalyze() {
    if (!preview) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis(analyzeStorefront(fileName || "fleet-vehicle.jpg"));
      setIsAnalyzing(false);
    }, 1800);
  }

  function handleReset() {
    setPreview(null);
    setAnalysis(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div className="saas-card p-6">
        <h2 className="text-lg font-semibold text-white">
          Upload Fleet / Vehicle Image
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Upload a photo of a business vehicle or fleet for Vehicle Branding Intelligence
        </p>

        {!preview ? (
          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-saas-border bg-white/5 px-6 py-12 transition-colors hover:border-violet-500/40 hover:bg-violet-500/10">
            <svg
              className="h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-slate-300">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs text-slate-400">PNG, JPG up to 10MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="mt-6">
            <div className="relative overflow-hidden rounded-xl border border-saas-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded fleet vehicle"
                className="max-h-80 w-full object-cover"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  "Analyze Vehicle Branding"
                )}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-saas-border px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
              >
                Upload Different Image
              </button>
            </div>
          </div>
        )}
      </div>

      {analysis && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="saas-card p-6">
            <h3 className="text-lg font-semibold text-white">
              Fleet Visibility Score
            </h3>
            <div className="mt-6 flex items-center gap-6">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={
                      analysis.visibilityScore >= 60
                        ? "#10b981"
                        : analysis.visibilityScore >= 40
                          ? "#f59e0b"
                          : "#ef4444"
                    }
                    strokeWidth="3"
                    strokeDasharray={`${analysis.visibilityScore}, 100`}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold text-white">
                    {analysis.visibilityScore}
                  </p>
                  <p className="text-xs text-slate-400">/100</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-300">
                  {analysis.visibilityScore >= 60
                    ? "Moderate visibility — room for improvement"
                    : analysis.visibilityScore >= 40
                      ? "Below average visibility — significant opportunity"
                      : "Poor fleet visibility — high wrap opportunity"}
                </p>
              </div>
            </div>
          </div>

          <div className="saas-card p-6">
            <h3 className="text-lg font-semibold text-white">
              Estimated Opportunity
            </h3>
            <p className="mt-4 text-4xl font-bold text-violet-400">
              {formatCurrency(analysis.estimatedOpportunity)}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Potential wrap project value based on detected fleet branding gaps
            </p>
          </div>

          <div className="saas-card p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              Detected Problems
            </h3>
            <ul className="mt-4 space-y-2">
              {analysis.problems.map((problem) => (
                <li
                  key={problem}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  {problem}
                </li>
              ))}
            </ul>
          </div>

          <div className="saas-card p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Recommended Improvements
            </h3>
            <ul className="mt-4 space-y-2">
              {analysis.recommendations.map((rec) => (
                <li
                  key={rec}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
