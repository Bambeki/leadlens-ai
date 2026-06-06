import StorefrontAnalyzer from "@/components/StorefrontAnalyzer";

export default function AnalyzerPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Fleet Branding Analyzer
        </h1>
        <p className="mt-1 text-slate-500">
          AI-powered Vehicle Branding Intelligence for prospect fleets
        </p>
      </div>

      <StorefrontAnalyzer />
    </div>
  );
}
