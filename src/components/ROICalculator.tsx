"use client";

import { useMemo, useState } from "react";
import {
  calculateROI,
  formatCurrency,
  formatHours,
} from "@/lib/roi-calculator";

const DEFAULTS = {
  averageProjectValue: 8500,
  leadsContacted: 40,
  conversionRate: 12,
};

function RevenueBarChart({
  data,
  maxValue,
}: {
  data: { month: string; revenue: number }[];
  maxValue: number;
}) {
  const chartHeight = 180;
  const barWidth = 28;
  const gap = 12;
  const width = data.length * (barWidth + gap) + gap;
  const padding = { top: 12, bottom: 28 };

  return (
    <svg viewBox={`0 0 ${width} ${chartHeight + padding.bottom}`} className="w-full">
      <defs>
        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const h = maxValue > 0 ? (d.revenue / maxValue) * chartHeight : 0;
        const x = gap + i * (barWidth + gap);
        const y = padding.top + chartHeight - h;
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={4}
              fill="url(#revenueGrad)"
              className="transition-all duration-300"
            />
            <text
              x={x + barWidth / 2}
              y={chartHeight + padding.top + 16}
              textAnchor="middle"
              className="fill-slate-400 text-[9px]"
            >
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ConversionDonut({
  converted,
  total,
}: {
  converted: number;
  total: number;
}) {
  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? converted / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">
          {total > 0 ? Math.round(pct * 100) : 0}%
        </span>
        <span className="text-xs text-slate-400">conversion</span>
      </div>
    </div>
  );
}

function TimeComparisonChart({
  manual,
  automated,
  saved,
}: {
  manual: number;
  automated: number;
  saved: number;
}) {
  const max = Math.max(manual, 1);
  const barMaxWidth = 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Manual outreach</span>
          <span className="font-semibold text-white">{formatHours(manual)}</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-slate-400 transition-all duration-500"
            style={{ width: `${(manual / max) * barMaxWidth}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">With LeadLens AI</span>
          <span className="font-semibold text-violet-400">{formatHours(automated)}</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-violet-500/150 transition-all duration-500"
            style={{ width: `${(automated / max) * barMaxWidth}%` }}
          />
        </div>
      </div>
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-300">Time saved</span>
          <span className="text-lg font-bold text-emerald-400">{formatHours(saved)}</span>
        </div>
        <p className="mt-1 text-xs text-emerald-400/80">
          ~37 min saved per lead (research, scoring, outreach drafting)
        </p>
      </div>
    </div>
  );
}

export default function ROICalculator() {
  const [averageProjectValue, setAverageProjectValue] = useState(
    DEFAULTS.averageProjectValue
  );
  const [leadsContacted, setLeadsContacted] = useState(DEFAULTS.leadsContacted);
  const [conversionRate, setConversionRate] = useState(DEFAULTS.conversionRate);

  const results = useMemo(
    () =>
      calculateROI({
        averageProjectValue,
        leadsContacted,
        conversionRate,
      }),
    [averageProjectValue, leadsContacted, conversionRate]
  );

  const maxProjection = results.monthlyProjection.at(-1)?.revenue ?? 1;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Inputs */}
        <div className="lg:col-span-2">
          <div className="saas-card p-6">
            <h2 className="text-lg font-semibold text-white">Your Inputs</h2>
            <p className="mt-1 text-sm text-slate-400">
              Adjust sliders to model your vehicle branding business ROI
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Average project value
                  </label>
                  <span className="text-sm font-bold text-violet-400">
                    {formatCurrency(averageProjectValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={50000}
                  step={500}
                  value={averageProjectValue}
                  onChange={(e) =>
                    setAverageProjectValue(Number(e.target.value))
                  }
                  className="mt-2 w-full accent-violet-500"
                />
                <input
                  type="number"
                  min={2000}
                  max={50000}
                  step={500}
                  value={averageProjectValue}
                  onChange={(e) =>
                    setAverageProjectValue(Number(e.target.value) || 0)
                  }
                  className="saas-input mt-2 w-full px-3 py-2 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Leads contacted / month
                  </label>
                  <span className="text-sm font-bold text-violet-400">
                    {leadsContacted}
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={leadsContacted}
                  onChange={(e) => setLeadsContacted(Number(e.target.value))}
                  className="mt-2 w-full accent-violet-500"
                />
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={leadsContacted}
                  onChange={(e) =>
                    setLeadsContacted(Number(e.target.value) || 0)
                  }
                  className="saas-input mt-2 w-full px-3 py-2 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Conversion rate
                  </label>
                  <span className="text-sm font-bold text-violet-400">
                    {conversionRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="mt-2 w-full accent-violet-500"
                />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={conversionRate}
                  onChange={(e) =>
                    setConversionRate(Number(e.target.value) || 0)
                  }
                  className="saas-input mt-2 w-full px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output cards */}
        <div className="lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="saas-glow-card border-violet-500/25 bg-gradient-to-br from-violet-500/15 to-saas-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                Monthly Revenue
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatCurrency(results.monthlyRevenue)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {results.dealsWon.toFixed(1)} deals ×{" "}
                {formatCurrency(averageProjectValue)}
              </p>
            </div>
            <div className="saas-glow-card border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-saas-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                Annual Revenue
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatCurrency(results.annualRevenue)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                12 × monthly projection
              </p>
            </div>
            <div className="saas-glow-card border-blue-500/25 bg-gradient-to-br from-blue-500/15 to-saas-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                Time Saved
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatHours(results.timeSavedHours)}
              </p>
              <p className="mt-1 text-xs text-slate-400">per month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="saas-card p-6 lg:col-span-2">
          <h3 className="font-semibold text-white">
            Cumulative Revenue Projection
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            12-month revenue at current conversion rate
          </p>
          <div className="mt-6">
            <RevenueBarChart
              data={results.monthlyProjection}
              maxValue={maxProjection}
            />
          </div>
          <p className="mt-2 text-right text-sm font-semibold text-violet-400">
            Year-end total: {formatCurrency(results.annualRevenue)}
          </p>
        </div>

        <div className="saas-card p-6">
          <h3 className="font-semibold text-white">Conversion Funnel</h3>
          <p className="mt-1 text-sm text-slate-400">
            Leads contacted vs deals won
          </p>
          <div className="mt-6">
            <ConversionDonut
              converted={results.dealsWon}
              total={leadsContacted}
            />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Contacted</span>
              <span className="font-semibold text-white">{leadsContacted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Converted</span>
              <span className="font-semibold text-emerald-400">
                {results.dealsWon.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="saas-card p-6 lg:col-span-3">
          <h3 className="font-semibold text-white">
            Outreach Time Comparison
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Manual research & outreach vs LeadLens AI automation
          </p>
          <div className="mt-6 max-w-md">
            <TimeComparisonChart
              manual={results.manualHours}
              automated={results.automatedHours}
              saved={results.timeSavedHours}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
