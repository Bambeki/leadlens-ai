"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DEMO_STEPS,
  DEMO_STEP_DURATION_MS,
  demoLead,
  demoAnalysisInsights,
  demoEmail,
} from "@/lib/demo-mode";
import { SCORE_LABELS, SCORE_WEIGHTS, formatCurrency } from "@/lib/scoring";
import type { ScoringFactor } from "@/lib/types";

const scoreFactors: ScoringFactor[] = [
  "recentlyOpened",
  "activeSocialMedia",
  "multipleLocations",
  "brandingOpportunity",
  "regionalProximity",
];

interface DemoModeProps {
  isOpen: boolean;
  onClose: () => void;
}

function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: Set<number>;
}) {
  return (
    <div className="flex items-center justify-center gap-0">
      {DEMO_STEPS.map((step, index) => {
        const stepNum = step.id;
        const isActive = currentStep === stepNum;
        const isComplete = completedSteps.has(stepNum);
        const isLast = index === DEMO_STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isComplete
                    ? "border-emerald-400 bg-emerald-500 text-white"
                    : isActive
                      ? "border-violet-400 bg-violet-600 text-white shadow-lg shadow-violet-500/40"
                      : "border-slate-600 bg-slate-800 text-slate-500"
                }`}
              >
                {isComplete ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-7.5" />
                  </svg>
                ) : isActive ? (
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-300 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                  </span>
                ) : (
                  <span className="text-sm font-semibold">{stepNum}</span>
                )}
              </div>
              <span
                className={`mt-2 hidden text-xs font-medium sm:block ${
                  isActive
                    ? "text-violet-300"
                    : isComplete
                      ? "text-emerald-400"
                      : "text-slate-500"
                }`}
              >
                {step.title}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 h-0.5 w-8 transition-all duration-700 sm:w-16 md:w-24 ${
                  isComplete ? "bg-emerald-500" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DiscoverStep({ visible }: { visible: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-8">
        <div
          className={`h-48 w-48 rounded-full border border-indigo-500/30 transition-opacity duration-700 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border border-dashed border-indigo-400/40" />
          <div className="absolute inset-4 animate-[spin_6s_linear_infinite_reverse] rounded-full border border-indigo-400/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 animate-pulse rounded-full bg-indigo-500/10" />
          </div>
          <div
            className="absolute left-1/2 top-0 h-1/2 w-0.5 origin-bottom bg-gradient-to-t from-indigo-500 to-transparent"
            style={{ animation: "spin 2s linear infinite" }}
          />
        </div>
        <div className="absolute -right-2 -top-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
          LIVE
        </div>
      </div>

      <div
        className={`w-full max-w-md transition-all duration-700 ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
        style={{ transitionDelay: "1200ms" }}
      >
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/50 p-6 backdrop-blur">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-emerald-400">
              New Lead Discovered
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {demoLead.businessName}
          </h3>
          <p className="mt-1 text-slate-400">
            {demoLead.industry} · {demoLead.location}, {demoLead.city}
          </p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
              {demoLead.industry}
            </span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
              Vehicle Branding Gap
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyzeStep({ visibleCount }: { visibleCount: number }) {
  const icons: Record<string, React.ReactNode> = {
    calendar: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    social: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v11.18Z" />
      </svg>
    ),
    star: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    sign: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      </svg>
    ),
    traffic: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-white">{demoLead.businessName}</h3>
        <p className="text-sm text-slate-400">Business Intelligence Report</p>
      </div>
      <div className="space-y-3">
        {demoAnalysisInsights.map((insight, i) => (
          <div
            key={insight.label}
            className={`flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 px-5 py-4 transition-all duration-500 ${
              i < visibleCount
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              {icons[insight.icon]}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {insight.label}
              </p>
              <p className="text-sm font-semibold text-white">{insight.value}</p>
            </div>
            {i < visibleCount && (
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-7.5" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreStep({ animatedScore, barProgress }: { animatedScore: number; barProgress: number }) {
  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 flex items-center justify-center">
        <div className="relative">
          <svg className="h-40 w-40 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#334155"
              strokeWidth="2.5"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeDasharray={`${animatedScore}, 100`}
              className="transition-all duration-100"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-white">{animatedScore}</span>
            <span className="text-sm text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2">
        <span className="rounded-full bg-red-500/20 px-4 py-1.5 text-sm font-bold text-red-400 ring-1 ring-red-500/30">
          HIGH PRIORITY
        </span>
      </div>

      <div className="space-y-3">
        {scoreFactors.map((factor) => {
          const score = demoLead.scoreBreakdown[factor];
          const max = SCORE_WEIGHTS[factor];
          const fill = score > 0 ? barProgress * 100 : 0;
          const displayScore = Math.round(score * barProgress);
          return (
            <div key={factor}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{SCORE_LABELS[factor]}</span>
                <span className="font-semibold text-white">
                  {displayScore} / {max}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
                  style={{ width: `${fill}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecommendStep({ visibleCount }: { visibleCount: number }) {
  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-400">Recommended for</p>
        <h3 className="text-xl font-bold text-white">{demoLead.businessName}</h3>
        <p className="mt-2 text-2xl font-bold text-indigo-400">
          {formatCurrency(demoLead.estimatedValue.min)} –{" "}
          {formatCurrency(demoLead.estimatedValue.max)}
        </p>
        <p className="text-xs text-slate-500">Estimated project value</p>
      </div>

      <div className="space-y-3">
        {demoLead.recommendedServices.map((service, i) => (
          <div
            key={service}
            className={`flex items-center gap-4 rounded-xl border border-indigo-500/20 bg-indigo-950/40 px-5 py-4 transition-all duration-500 ${
              i < visibleCount
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <span className="font-semibold text-white">{service}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutreachStep({ typedText }: { typedText: string }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-indigo-300">
          AI-Generated Outreach Email
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800/80 p-6">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
          {typedText}
          <span className="inline-block h-4 w-0.5 animate-pulse bg-indigo-400" />
        </pre>
      </div>
    </div>
  );
}

export default function DemoMode({ isOpen, onClose }: DemoModeProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(true);
  const [discoverVisible, setDiscoverVisible] = useState(false);
  const [analyzeVisibleCount, setAnalyzeVisibleCount] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [barProgress, setBarProgress] = useState(0);
  const [recommendVisibleCount, setRecommendVisibleCount] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setIsPlaying(true);
    setDiscoverVisible(false);
    setAnalyzeVisibleCount(0);
    setAnimatedScore(0);
    setBarProgress(0);
    setRecommendVisibleCount(0);
    setTypedText("");
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    reset();
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    if (currentStep === 1) {
      const t1 = setTimeout(() => setDiscoverVisible(true), 800);
      const t2 = setTimeout(() => {
        setCompletedSteps((s) => new Set([...s, 1]));
        setCurrentStep(2);
      }, DEMO_STEP_DURATION_MS);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    if (currentStep === 2) {
      const timers: ReturnType<typeof setTimeout>[] = [];
      demoAnalysisInsights.forEach((_, i) => {
        timers.push(setTimeout(() => setAnalyzeVisibleCount(i + 1), 500 + i * 600));
      });
      timers.push(
        setTimeout(() => {
          setCompletedSteps((s) => new Set([...s, 2]));
          setCurrentStep(3);
        }, DEMO_STEP_DURATION_MS + demoAnalysisInsights.length * 200)
      );
      return () => timers.forEach(clearTimeout);
    }

    if (currentStep === 3) {
      const target = demoLead.scoreBreakdown.total;
      let score = 0;
      const scoreInterval = setInterval(() => {
        score += 2;
        if (score >= target) {
          score = target;
          clearInterval(scoreInterval);
        }
        setAnimatedScore(score);
      }, 30);

      const barInterval = setInterval(() => {
        setBarProgress((p) => {
          if (p >= 1) {
            clearInterval(barInterval);
            return 1;
          }
          return p + 0.04;
        });
      }, 40);
      const nextTimer = setTimeout(() => {
        setCompletedSteps((s) => new Set([...s, 3]));
        setCurrentStep(4);
      }, DEMO_STEP_DURATION_MS);

      return () => {
        clearInterval(scoreInterval);
        clearInterval(barInterval);
        clearTimeout(nextTimer);
      };
    }

    if (currentStep === 4) {
      const timers: ReturnType<typeof setTimeout>[] = [];
      demoLead.recommendedServices.forEach((_, i) => {
        timers.push(setTimeout(() => setRecommendVisibleCount(i + 1), 400 + i * 500));
      });
      timers.push(
        setTimeout(() => {
          setCompletedSteps((s) => new Set([...s, 4]));
          setCurrentStep(5);
        }, DEMO_STEP_DURATION_MS + demoLead.recommendedServices.length * 200)
      );
      return () => timers.forEach(clearTimeout);
    }

    if (currentStep === 5) {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        charIndex += 3;
        if (charIndex >= demoEmail.length) {
          setTypedText(demoEmail);
          clearInterval(typeInterval);
        } else {
          setTypedText(demoEmail.slice(0, charIndex));
        }
      }, 20);

      const completeTimer = setTimeout(() => {
        setTypedText(demoEmail);
        setCompletedSteps((s) => new Set([...s, 5]));
        setIsComplete(true);
        setIsPlaying(false);
      }, DEMO_STEP_DURATION_MS + 2000);

      return () => {
        clearInterval(typeInterval);
        clearTimeout(completeTimer);
      };
    }
  }, [currentStep, isOpen, isPlaying]);

  function handleNext() {
    if (currentStep >= 5) return;
    setCompletedSteps((s) => new Set([...s, currentStep]));
    const next = currentStep + 1;
    setCurrentStep(next);
    if (next === 2) setDiscoverVisible(true);
    if (next === 3) setAnalyzeVisibleCount(demoAnalysisInsights.length);
    if (next === 4) {
      setAnimatedScore(demoLead.scoreBreakdown.total);
      setBarProgress(1);
    }
    if (next === 5) {
      setRecommendVisibleCount(demoLead.recommendedServices.length);
      setTypedText(demoEmail);
    }
  }

  function handleRestart() {
    reset();
  }

  if (!isOpen) return null;

  const step = DEMO_STEPS[currentStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-saas-bg/98 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-saas-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Live Demo</p>
            <p className="text-xs text-slate-500">DHL Fleet Services workflow</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="border-b border-saas-border px-6 py-6">
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8">
        <div className="demo-step-enter mb-8 text-center">
          <p className="text-sm font-medium text-violet-400">
            Step {currentStep} of {DEMO_STEPS.length}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">{step.label}</h2>
          <p className="mt-2 text-slate-400">{step.description}</p>
        </div>

        <div className="demo-step-enter demo-cinematic-glow flex w-full items-center justify-center rounded-2xl border border-violet-500/20 bg-saas-card/50 p-8">
          {currentStep === 1 && <DiscoverStep visible={discoverVisible} />}
          {currentStep === 2 && <AnalyzeStep visibleCount={analyzeVisibleCount} />}
          {currentStep === 3 && (
            <ScoreStep animatedScore={animatedScore} barProgress={barProgress} />
          )}
          {currentStep === 4 && (
            <RecommendStep visibleCount={recommendVisibleCount} />
          )}
          {currentStep === 5 && <OutreachStep typedText={typedText} />}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-saas-border px-6 py-4">
        <div className="flex items-center gap-2">
          {isPlaying && !isComplete && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
              <span className="text-sm text-slate-400">Running demo…</span>
            </>
          )}
          {isComplete && (
            <span className="text-sm font-medium text-emerald-400">
              Demo complete — lead ready for outreach!
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {isComplete ? (
            <>
              <button
                onClick={handleRestart}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                Run Again
              </button>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
              >
                Open Dashboard
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsPlaying(false)}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                Pause
              </button>
              {currentStep < 5 && (
                <button
                  onClick={handleNext}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                >
                  Skip to Next Step
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function DemoModeButton({
  variant = "primary",
  className = "",
}: {
  variant?: "primary" | "sidebar" | "hero";
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const styles = {
    primary:
      "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-indigo-600/40",
    hero: "inline-flex items-center gap-2 rounded-xl border-2 border-violet-500/50 bg-violet-950/30 px-8 py-3.5 text-base font-semibold text-violet-200 backdrop-blur transition-all hover:border-violet-400 hover:bg-violet-900/40 hover:text-white",
    sidebar:
      "flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500",
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={`${styles[variant]} ${className}`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        </svg>
        Live Demo
      </button>
      <DemoMode isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
