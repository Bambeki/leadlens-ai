import type { CRMStatus } from "./types";

export const CRM_STATUSES: CRMStatus[] = [
  "Not Contacted",
  "Contacted",
  "Responded",
  "Meeting Scheduled",
  "Won",
  "Lost",
];

export const CRM_STATUS_STYLES: Record<
  CRMStatus,
  { bg: string; text: string; ring: string; dot: string }
> = {
  "Not Contacted": {
    bg: "bg-white/10",
    text: "text-slate-300",
    ring: "ring-white/10",
    dot: "bg-slate-400",
  },
  Contacted: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    ring: "ring-blue-500/20",
    dot: "bg-blue-500",
  },
  Responded: {
    bg: "bg-violet-500/15",
    text: "text-violet-400",
    ring: "ring-violet-500/20",
    dot: "bg-violet-500",
  },
  "Meeting Scheduled": {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    ring: "ring-amber-500/20",
    dot: "bg-amber-500",
  },
  Won: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  Lost: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    ring: "ring-red-500/20",
    dot: "bg-red-500",
  },
};

export function assignInitialCrmStatus(id: string): CRMStatus {
  const n = parseInt(id, 10) || id.charCodeAt(0);
  const distribution: CRMStatus[] = [
    "Not Contacted", "Not Contacted", "Not Contacted", "Not Contacted",
    "Not Contacted", "Not Contacted", "Not Contacted", "Not Contacted",
    "Contacted", "Contacted", "Contacted", "Contacted",
    "Responded", "Responded",
    "Meeting Scheduled", "Meeting Scheduled",
    "Won",
    "Lost",
  ];
  return distribution[n % distribution.length];
}
