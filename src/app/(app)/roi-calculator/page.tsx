import ROICalculator from "@/components/ROICalculator";

export default function ROICalculatorPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">ROI Calculator</h1>
        <p className="mt-1 text-slate-500">
          Model revenue impact and time savings from AI-powered lead acquisition
        </p>
      </div>
      <ROICalculator />
    </div>
  );
}
