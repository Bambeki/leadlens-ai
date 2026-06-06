import LeadImport from "@/components/LeadImport";

export default function LeadImportPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Lead Import</h1>
        <p className="mt-1 text-slate-500">
          Effortless B2B discovery — detect your location, pick business types,
          and import scored leads to your pipeline
        </p>
      </div>
      <LeadImport />
    </div>
  );
}
