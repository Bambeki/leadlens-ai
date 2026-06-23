import DashboardClient from "@/components/DashboardClient";
import { leads } from "@/lib/base-data";

export default function DashboardPage() {
  return <DashboardClient baseLeads={leads} />;
}
