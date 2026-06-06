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
    <div className="saas-card p-6">
      <h3 className="text-lg font-semibold text-white">Score Breakdown</h3>
      <p className="mt-1 text-sm text-slate-400">
        Lead scoring model — total out of 100 points
      </p>

      <div className="mt-6 flex items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="3"
              strokeDasharray={`${breakdown.total}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-bold text-white">
              {breakdown.total}
            </p>
            <p className="text-xs text-slate-400">/ 100</p>
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
                    active ? "font-medium text-slate-300" : "text-slate-500"
                  }
                >
                  {SCORE_LABELS[factor]}
                </span>
                <span
                  className={
                    active ? "font-semibold text-white" : "text-slate-500"
                  }
                >
                  {score} / {max}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    active ? "bg-violet-500" : "bg-white/5"
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
