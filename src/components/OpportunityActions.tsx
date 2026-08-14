"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/types";
import {
  deleteOpportunityInApi,
  updateOpportunityLifecycleInApi,
} from "@/lib/opportunity-api";
import { LEADS_UPDATED_EVENT } from "@/lib/imported-leads";
import Button from "./ui/Button";

export default function OpportunityActions({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"archive" | "restore" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const archived = Boolean(lead.archivedAt);
  const doNotContact = Boolean(lead.doNotContact);

  async function runLifecycle(action: "archive" | "restore") {
    setBusy(action);
    setError(null);
    try {
      await updateOpportunityLifecycleInApi(lead.id, action);
      window.dispatchEvent(new CustomEvent(LEADS_UPDATED_EVENT));
      router.refresh();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update opportunity.");
    } finally {
      setBusy(null);
    }
  }

  async function runDelete() {
    setBusy("delete");
    setError(null);
    try {
      await deleteOpportunityInApi(lead.id, confirmName);
      window.dispatchEvent(new CustomEvent(LEADS_UPDATED_EVENT));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete opportunity.");
      setBusy(null);
    }
  }

  return (
    <div className="saas-card p-6">
      <h3 className="text-lg font-semibold text-white">Opportunity actions</h3>
      <p className="mt-1 text-sm text-slate-400">
        Archive keeps history. Permanent delete is only for mistakes or test imports.
      </p>

      {doNotContact && (
        <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
          Do Not Contact. Outreach is blocked until this opportunity is restored.
        </p>
      )}
      {archived && !doNotContact && (
        <p className="mt-3 rounded-lg border border-slate-500/20 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
          This opportunity is archived and hidden from the active pipeline.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {archived || doNotContact ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy != null}
            onClick={() => runLifecycle("restore")}
          >
            {busy === "restore" ? "Restoring..." : "Restore"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy != null}
            onClick={() => runLifecycle("archive")}
          >
            {busy === "archive" ? "Archiving..." : "Archive"}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-red-300 hover:text-red-200"
          disabled={busy != null}
          onClick={() => setConfirmOpen((open) => !open)}
        >
          Delete permanently
        </Button>
      </div>

      {confirmOpen && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-semibold text-red-200">Permanent delete</p>
          <p className="mt-1 text-xs text-red-200/90">
            This cannot be undone. Related outreach, meetings, evidence, contacts,
            and status history will also be deleted.
          </p>
          <label className="mt-3 block text-xs text-slate-300">
            Type the business name to confirm
            <input
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              className="mt-1 w-full rounded-md border border-saas-border bg-saas-card px-3 py-2 text-sm text-white"
              placeholder={lead.businessName}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="danger"
              disabled={busy != null || confirmName.trim() !== lead.businessName.trim()}
              onClick={runDelete}
            >
              {busy === "delete" ? "Deleting..." : "Delete permanently"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs font-medium text-red-300">{error}</p>
      )}
    </div>
  );
}
