import type { Priority } from "@/lib/types";

const styles: Record<Priority, string> = {
  High: "bg-red-50 text-red-700 ring-red-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
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
