export interface ROIInputs {
  averageProjectValue: number;
  leadsContacted: number;
  conversionRate: number;
}

export interface ROIResults {
  dealsWon: number;
  monthlyRevenue: number;
  annualRevenue: number;
  timeSavedHours: number;
  manualHours: number;
  automatedHours: number;
  monthlyProjection: { month: string; revenue: number }[];
}

const MANUAL_MINUTES_PER_LEAD = 45;
const AUTOMATED_MINUTES_PER_LEAD = 8;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function calculateROI(inputs: ROIInputs): ROIResults {
  const { averageProjectValue, leadsContacted, conversionRate } = inputs;
  const rate = Math.min(Math.max(conversionRate, 0), 100) / 100;

  const dealsWon = leadsContacted * rate;
  const monthlyRevenue = dealsWon * averageProjectValue;
  const annualRevenue = monthlyRevenue * 12;

  const minutesSaved =
    leadsContacted * (MANUAL_MINUTES_PER_LEAD - AUTOMATED_MINUTES_PER_LEAD);
  const timeSavedHours = minutesSaved / 60;
  const manualHours = (leadsContacted * MANUAL_MINUTES_PER_LEAD) / 60;
  const automatedHours = (leadsContacted * AUTOMATED_MINUTES_PER_LEAD) / 60;

  const monthlyProjection = MONTHS.map((month, i) => ({
    month,
    revenue: monthlyRevenue * (i + 1),
  }));

  return {
    dealsWon,
    monthlyRevenue,
    annualRevenue,
    timeSavedHours,
    manualHours,
    automatedHours,
    monthlyProjection,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours.toFixed(1)} hrs`;
}
