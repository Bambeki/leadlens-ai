interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "violet" | "red" | "amber" | "emerald" | "slate";
}

const accentStyles = {
  violet: "bg-violet-500/15 text-violet-400 ring-violet-500/20",
  red: "bg-red-500/15 text-red-400 ring-red-500/20",
  amber: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
  emerald: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  slate: "bg-white/5 text-slate-400 ring-white/10",
};

const glowStyles = {
  violet: "hover:shadow-violet-500/10",
  red: "hover:shadow-red-500/10",
  amber: "hover:shadow-amber-500/10",
  emerald: "hover:shadow-emerald-500/10",
  slate: "hover:shadow-white/5",
};

export default function StatCard({
  label,
  value,
  icon,
  accent = "violet",
}: StatCardProps) {
  return (
    <div
      className={`saas-glow-card p-6 ${glowStyles[accent]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
