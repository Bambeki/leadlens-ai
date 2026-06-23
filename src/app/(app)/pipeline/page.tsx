import PipelineClient from "@/components/PipelineClient";
import { leads } from "@/lib/base-data";

export default function PipelinePage() {
  return <PipelineClient baseLeads={leads} />;
}
