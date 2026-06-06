import type { CRMStatus } from "@/lib/types";
import { CRM_STATUS_STYLES } from "@/lib/crm";

export default function CRMStatusBadge({ status }: { status: CRMStatus }) {
  const style = CRM_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style.bg} ${style.text} ${style.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
