interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "indigo" | "red" | "amber" | "emerald" | "slate";
}

const accentStyles = {
  indigo: "bg-indigo-50 text-indigo-600",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function StatCard({
  label,
  value,
  icon,
  accent = "indigo",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
