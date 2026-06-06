import DashboardClient from "@/components/DashboardClient";
import { leads } from "@/lib/mock-data";

export default function DashboardPage() {
  return <DashboardClient baseLeads={leads} />;
}
