import StorefrontAnalyzer from "@/components/StorefrontAnalyzer";

export default function AnalyzerPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Vehicle Branding Audit
        </h1>
        <p className="mt-1 text-slate-400">
          Analyze vehicle photos for branding gaps and project value
        </p>
      </div>

      <StorefrontAnalyzer />
    </div>
  );
}
