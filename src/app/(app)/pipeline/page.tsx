import PipelineClient from "@/components/PipelineClient";
import { leads } from "@/lib/mock-data";

export default function PipelinePage() {
  return <PipelineClient baseLeads={leads} />;
}
