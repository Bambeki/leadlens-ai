import type { Priority } from "@/lib/types";

const styles: Record<Priority, string> = {
  High: "bg-red-500/15 text-red-400 ring-red-500/30",
  Medium: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}
