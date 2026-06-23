import ROICalculator from "@/components/ROICalculator";

export default function ROICalculatorPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ROI Calculator</h1>
        <p className="mt-1 text-slate-400">
          Model potential revenue impact and time savings from opportunity discovery
        </p>
      </div>
      <ROICalculator />
    </div>
  );
}
