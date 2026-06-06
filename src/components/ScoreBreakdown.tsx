import type { ScoreBreakdown as ScoreBreakdownType } from "@/lib/types";
import { SCORE_LABELS, SCORE_WEIGHTS } from "@/lib/scoring";
import type { ScoringFactor } from "@/lib/types";

const factors: ScoringFactor[] = [
  "recentlyOpened",
  "activeSocialMedia",
  "multipleLocations",
  "brandingOpportunity",
  "regionalProximity",
];

export default function ScoreBreakdown({
  breakdown,
}: {
  breakdown: ScoreBreakdownType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Score Breakdown</h3>
      <p className="mt-1 text-sm text-slate-500">
        Lead scoring model — total out of 100 points
      </p>

      <div className="mt-6 flex items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeDasharray={`${breakdown.total}, 100`}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-bold text-slate-900">
              {breakdown.total}
            </p>
            <p className="text-xs text-slate-500">/ 100</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {factors.map((factor) => {
          const score = breakdown[factor];
          const max = SCORE_WEIGHTS[factor];
          const active = score > 0;
          return (
            <div key={factor}>
              <div className="flex items-center justify-between text-sm">
                <span
                  className={
                    active ? "font-medium text-slate-700" : "text-slate-400"
                  }
                >
                  {SCORE_LABELS[factor]}
                </span>
                <span
                  className={
                    active ? "font-semibold text-slate-900" : "text-slate-400"
                  }
                >
                  {score} / {max}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    active ? "bg-indigo-500" : "bg-slate-200"
                  }`}
                  style={{ width: `${(score / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
