"use client";

import { useEffect, useState } from "react";
import type { CRMStatus } from "@/lib/types";
import { CRM_STATUSES, CRM_STATUS_STYLES } from "@/lib/crm";
import {
  CRM_UPDATED_EVENT,
  getCrmOverride,
  updateCrmStatus,
  addActivity,
} from "@/lib/crm-store";
import { createNotification } from "@/lib/notifications";
import CRMStatusBadge from "./CRMStatusBadge";

export default function CRMStatusTracker({
  leadId,
  initialStatus,
}: {
  leadId: string;
  initialStatus: CRMStatus;
}) {
  const [status, setStatus] = useState<CRMStatus>(initialStatus);

  useEffect(() => {
    const saved = getCrmOverride(leadId);
    if (saved) setStatus(saved);
  }, [leadId]);

  useEffect(() => {
    function onUpdate(e: Event) {
      const detail = (e as CustomEvent<{ leadId: string; status?: CRMStatus }>)
        .detail;
      if (detail?.leadId === leadId && detail.status) {
        setStatus(detail.status);
      } else if (detail?.leadId === leadId) {
        const saved = getCrmOverride(leadId);
        if (saved) setStatus(saved);
      }
    }
    window.addEventListener(CRM_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CRM_UPDATED_EVENT, onUpdate);
  }, [leadId]);

  function handleChange(next: CRMStatus) {
    updateCrmStatus(leadId, next);
    addActivity(leadId, "crm_manual_update", `CRM changed to ${next}`);
    setStatus(next);
    window.dispatchEvent(
      new CustomEvent("leadlens-notification", {
        detail: createNotification(
          "crm_updated",
          `Lead status changed to ${next}.`
        ),
      })
    );
  }

  const currentIndex = CRM_STATUSES.indexOf(status);

  return (
    <div className="saas-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">CRM Tracking</h2>
          <p className="text-sm text-slate-400">Pipeline status management</p>
        </div>
        <CRMStatusBadge status={status} />
      </div>

      <div className="mt-6 flex flex-wrap gap-1">
        {CRM_STATUSES.map((s, i) => {
          const style = CRM_STATUS_STYLES[s];
          const isActive = s === status;
          const isPast = i < currentIndex;
          return (
            <button
              key={s}
              onClick={() => handleChange(s)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? `${style.bg} ${style.text} ring-2 ring-offset-1 ${style.ring}`
                  : isPast
                    ? "bg-white/10 text-slate-400"
                    : "bg-saas-card text-slate-400 ring-1 ring-saas-border hover:bg-white/5 hover:text-slate-300"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / CRM_STATUSES.length) * 100}%`,
          }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Click a status to update CRM stage — saved locally for demo
      </p>
    </div>
  );
}
