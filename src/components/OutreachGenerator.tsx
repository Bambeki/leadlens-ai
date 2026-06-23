"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lead } from "@/lib/types";
import { generateOutreachEmail } from "@/lib/outreach";
import {
  MEETING_OPTIONS,
  insertMeetingSuggestion,
  type MeetingType,
} from "@/lib/meeting-suggestions";
import {
  parseOutreachEmail,
  sendEmailViaApi,
  getSavedTestEmail,
  saveTestEmail,
  saveOutreachDraft,
  getOutreachDraft,
  composeOutreachEmail,
} from "@/lib/email";
import {
  DEFAULT_EMAIL_CTA_CONFIG,
  prepareEmailPayload,
  type EmailCtaConfig,
} from "@/lib/email-template";
import EmailCtaConfigPanel from "./EmailCtaConfig";
import EmailPreview from "./EmailPreview";
import { fetchSystemStatus } from "@/lib/system-status-client";
import {
  CRM_UPDATED_EVENT,
  getOutreachStatus,
  updateOutreachStatus,
  addActivity,
  SENT_OUTREACH_STATUSES,
  type OutreachStatus,
} from "@/lib/crm-store";
import { MEETINGS_UPDATED_EVENT } from "@/lib/meetings";
import {
  EMPTY_LEAD_WORKFLOW_STATE,
  getLeadWorkflowState,
} from "@/lib/lead-workflow";
import { processEmailSent } from "@/lib/event-automation";
import { useHasMounted } from "@/hooks/useHasMounted";
import Button from "./ui/Button";

const CORE_STEPS = [
  { id: "drafted", label: "Drafted" },
  { id: "approved", label: "Approved" },
  { id: "sent", label: "Sent" },
] as const;

const POST_SEND_STEPS = [
  { id: "responded", label: "Customer Responded" },
  { id: "meeting", label: "Meeting Scheduled" },
] as const;

type CoreStep = (typeof CORE_STEPS)[number]["id"];
type WorkflowStep = CoreStep;

export default function OutreachGenerator({ lead }: { lead: Lead }) {
  const hasMounted = useHasMounted();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<MeetingType | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [useTestEmail, setUseTestEmail] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [delivery, setDelivery] = useState<{
    messageId: string;
    sentTo: string;
  } | null>(null);
  const [resendConfigured, setResendConfigured] = useState<boolean | null>(null);
  const [workflowState, setWorkflowState] = useState(EMPTY_LEAD_WORKFLOW_STATE);
  const [ctaConfig, setCtaConfig] = useState<EmailCtaConfig>(
    DEFAULT_EMAIL_CTA_CONFIG
  );
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  const isEditable = workflowStep === "drafted" && !delivery;
  const isSent = workflowStep === "sent" || delivery !== null;

  function applyGeneratedEmail(generated: string) {
    const parsed = parseOutreachEmail(generated);
    setSubject(parsed.subject);
    setBody(parsed.body);
    setDraftReady(true);
    saveOutreachDraft(lead.id, { ...parsed, ctaConfig });
  }

  const refreshWorkflow = useCallback(() => {
    const saved = getOutreachStatus(lead.id);
    if (saved) {
      const step = outreachToWorkflowStep(saved);
      setWorkflowStep(step);
      if (SENT_OUTREACH_STATUSES.includes(saved)) {
        setDelivery({ messageId: "saved", sentTo: "Previously sent" });
      }
      if (saved === "Drafted" || saved === "Approved") {
        const draft = getOutreachDraft(lead.id);
        if (draft) {
          setSubject(draft.subject);
          setBody(draft.body);
          setCtaConfig(draft.ctaConfig ?? DEFAULT_EMAIL_CTA_CONFIG);
          setDraftReady(true);
        }
      }
    }
    setWorkflowState(getLeadWorkflowState(lead.id));
  }, [lead.id]);

  useEffect(() => {
    if (!hasMounted) return;
    const timeout = window.setTimeout(() => {
      setTestEmail(getSavedTestEmail());
      refreshWorkflow();
    }, 0);
    fetchSystemStatus().then((s) => setResendConfigured(s.resendReady));

    window.addEventListener(CRM_UPDATED_EVENT, refreshWorkflow);
    window.addEventListener(MEETINGS_UPDATED_EVENT, refreshWorkflow);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(CRM_UPDATED_EVENT, refreshWorkflow);
      window.removeEventListener(MEETINGS_UPDATED_EVENT, refreshWorkflow);
    };
  }, [hasMounted, refreshWorkflow]);

  function runGenerate(isRegenerate: boolean) {
    setIsGenerating(true);
    if (!isRegenerate) {
      setWorkflowStep(null);
      setActiveMeeting(null);
      setSendError(null);
      setDelivery(null);
    }
    setTimeout(() => {
      applyGeneratedEmail(
        generateOutreachEmail(
          lead,
          typeof window !== "undefined" ? window.location.origin : undefined
        )
      );
      setWorkflowStep("drafted");
      updateOutreachStatus(lead.id, "Drafted");
      addActivity(
        lead.id,
        "email_drafted",
        isRegenerate ? "Email regenerated" : "Email drafted"
      );
      setIsGenerating(false);
    }, 1200);
  }

  function handleGenerate() {
    runGenerate(false);
  }

  function handleRegenerate() {
    runGenerate(true);
  }

  function handleSaveEdits() {
    if (!draftReady) return;
    saveOutreachDraft(lead.id, { subject, body, ctaConfig });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  }

  function handleCtaConfigChange(config: EmailCtaConfig) {
    setCtaConfig(config);
    saveOutreachDraft(lead.id, { subject, body, ctaConfig: config });
    if (workflowStep === "approved") {
      setWorkflowStep("drafted");
      updateOutreachStatus(lead.id, "Drafted");
    }
  }

  function handleSubjectChange(value: string) {
    setSubject(value);
    if (workflowStep === "approved") {
      setWorkflowStep("drafted");
      updateOutreachStatus(lead.id, "Drafted");
    }
  }

  function handleBodyChange(value: string) {
    setBody(value);
    if (workflowStep === "approved") {
      setWorkflowStep("drafted");
      updateOutreachStatus(lead.id, "Drafted");
    }
  }

  function handleApprove() {
    if (!draftReady || workflowStep !== "drafted") return;
    saveOutreachDraft(lead.id, { subject, body, ctaConfig });
    setWorkflowStep("approved");
    setSendError(null);
    updateOutreachStatus(lead.id, "Approved");
    addActivity(lead.id, "email_approved", "Email approved");
  }

  async function handleSend() {
    if (!draftReady || workflowStep !== "approved") return;

    const recipient = useTestEmail
      ? testEmail.trim()
      : lead.contact.email;

    if (!recipient) {
      setSendError("Enter your test email address before sending.");
      return;
    }

    saveTestEmail(testEmail);
    setIsSending(true);
    setSendError(null);

    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const prepared = prepareEmailPayload({
      subject: subject.trim(),
      body: body.trim(),
      leadId: lead.id,
      baseUrl,
      ctaConfig,
    });

    const result = await sendEmailViaApi({
      to: recipient,
      subject: prepared.subject,
      body: prepared.body,
      html: prepared.html,
      leadName: lead.businessName,
    });

    setIsSending(false);

    if (!result.success) {
      setSendError(result.error ?? "Send failed");
      return;
    }

    setWorkflowStep("sent");
    setDelivery({
      messageId: result.messageId ?? "confirmed",
      sentTo: recipient,
    });

    processEmailSent(lead.id, recipient);
  }

  function handleMeeting(type: MeetingType) {
    if (!draftReady || isSent) return;
    const baseContent = activeMeeting
      ? generateOutreachEmail(
          lead,
          typeof window !== "undefined" ? window.location.origin : undefined
        )
      : composeOutreachEmail(subject, body);
    const updated = insertMeetingSuggestion(baseContent, type);
    const parsed = parseOutreachEmail(updated);
    setSubject(parsed.subject);
    setBody(parsed.body);
    saveOutreachDraft(lead.id, { ...parsed, ctaConfig });
    setActiveMeeting(type);
    if (workflowStep === "approved") {
      setWorkflowStep("drafted");
      updateOutreachStatus(lead.id, "Drafted");
    }
  }

  return (
    <div className="saas-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Outreach Workflow
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Drafted → Approved → Sent — full outreach control
          </p>
          {resendConfigured === false && (
            <p className="mt-2 text-xs font-medium text-amber-400">
              Email delivery is in preview mode. Connect your account in Email Center to send live.
            </p>
          )}
          {resendConfigured === true && (
            <p className="mt-2 text-xs font-medium text-emerald-400">
              Email delivery connected — ready to send
            </p>
          )}
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating || isSending}>
          {isGenerating ? "Generating…" : "Generate Outreach Email"}
        </Button>
      </div>

      {draftReady && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            {CORE_STEPS.map((step, i) => {
              const stepIdx = CORE_STEPS.findIndex((s) => s.id === workflowStep);
              const isActive = workflowStep === step.id;
              const isComplete =
                step.id === "drafted"
                  ? workflowStep !== null
                  : step.id === "approved"
                    ? stepIdx >= 1 || isSent
                    : isSent;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-violet-600 text-white shadow-sm"
                        : isComplete
                          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                          : "bg-white/5 text-slate-300 ring-1 ring-saas-border"
                    }`}
                  >
                    {isComplete && !isActive && (
                      <span className="text-emerald-500">✓</span>
                    )}
                    {step.label}
                  </div>
                  {i < CORE_STEPS.length - 1 && (
                    <svg
                      className="h-4 w-4 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {draftReady && workflowStep === "approved" && !delivery && (
        <div className="mt-5 rounded-lg border border-violet-500/20 bg-violet-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Send test to your email
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={useTestEmail}
              onChange={(e) => setUseTestEmail(e.target.checked)}
              className="rounded border-slate-300"
            />
            Send to my test address
          </label>
          {useTestEmail ? (
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-2 w-full rounded-lg border border-saas-border bg-saas-card px-4 py-2.5 text-sm focus:border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          ) : (
            <p className="mt-2 text-sm text-slate-300">
              Will send to lead contact:{" "}
              <span className="font-medium">{lead.contact.email}</span>
            </p>
          )}
          {sendError && (
            <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300">
              {sendError}
            </p>
          )}
        </div>
      )}

      {delivery && (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-7.5"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-emerald-200">Delivery Confirmed</h4>
              <p className="mt-1 text-sm text-emerald-300">
                Email successfully sent to{" "}
                <span className="font-semibold text-white">{delivery.sentTo}</span>
              </p>
              <p className="mt-2 font-mono text-xs text-emerald-400">
                Message ID: {delivery.messageId}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasMounted && (isSent || workflowState.meetingScheduled) && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Post-send workflow
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {POST_SEND_STEPS.map((step, i) => {
              const complete =
                step.id === "responded"
                  ? workflowState.customerResponded
                  : workflowState.meetingScheduled;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                      complete
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                        : "bg-white/5 text-slate-300 ring-1 ring-saas-border"
                    }`}
                  >
                    {complete && <span className="text-emerald-500">✓</span>}
                    {step.label}
                  </div>
                  {i < POST_SEND_STEPS.length - 1 && (
                    <svg
                      className="h-4 w-4 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
          {workflowState.meeting && (
            <p className="mt-3 text-xs font-medium text-emerald-400">
              ✓ Meeting auto-scheduled — {workflowState.meeting.displayTime}
            </p>
          )}
          {isSent && !workflowState.meetingScheduled && (
            <p className="mt-3 text-xs text-slate-400">
              Customer response links update this workflow automatically — no
              manual simulator needed for meetings.
            </p>
          )}
        </div>
      )}

      {draftReady && !isSent && (
        <div className="mt-5">
          <EmailCtaConfigPanel
            config={ctaConfig}
            onChange={handleCtaConfigChange}
            disabled={!isEditable}
          />
        </div>
      )}

      {draftReady && !isSent && (
        <div className="mt-5 rounded-lg border border-dashed border-violet-500/20 bg-violet-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Meeting Automation
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MEETING_OPTIONS.map((m) => (
              <Button
                key={m.id}
                variant={activeMeeting === m.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleMeeting(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {draftReady && (
        <div className="mt-6 rounded-lg border border-saas-border bg-white/5 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-300">
                AI draft — editable before sending
              </span>
              <div className="flex rounded-lg border border-saas-border bg-saas-card p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    viewMode === "edit"
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    viewMode === "preview"
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
            {workflowStep === "drafted" && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                Awaiting approval
              </span>
            )}
            {workflowStep === "approved" && !delivery && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                Approved — ready to send
              </span>
            )}
          </div>

          {viewMode === "preview" ? (
            <EmailPreview
              subject={subject}
              body={body}
              leadId={lead.id}
              ctaConfig={ctaConfig}
              baseUrl={
                typeof window !== "undefined"
                  ? window.location.origin
                  : undefined
              }
            />
          ) : (
            <>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                readOnly={!isEditable}
                className="mt-2 w-full rounded-lg border border-saas-border bg-saas-card px-4 py-2.5 text-sm font-medium text-white focus:border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-white/10 disabled:text-slate-300"
              />

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email body
              </label>
              <textarea
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                readOnly={!isEditable}
                rows={18}
                className="mt-2 w-full resize-y rounded-lg border border-saas-border bg-saas-card px-4 py-3 font-sans text-sm leading-relaxed text-slate-300 focus:border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-white/10 disabled:text-slate-300"
              />

              <p className="mt-2 text-xs text-slate-400">
                CTA buttons and a plain-text fallback are added automatically on
                send. Use Preview to see the HTML email.
              </p>
            </>
          )}

          {!isSent && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRegenerate}
                disabled={isGenerating || isSending}
              >
                {isGenerating ? "Regenerating…" : "Regenerate"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSaveEdits}
                disabled={!isEditable || isGenerating}
              >
                {saveFeedback ? "Saved!" : "Save edits"}
              </Button>
              {workflowStep === "drafted" && (
                <Button size="sm" onClick={handleApprove} disabled={isGenerating}>
                  Approve email
                </Button>
              )}
              {workflowStep === "approved" && !delivery && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setViewMode("preview")}
                  >
                    Preview before send
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={handleSend}
                    disabled={isSending}
                  >
                    {isSending ? "Sending…" : "Send Email"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!draftReady && !isGenerating && workflowStep === null && (
        <div className="mt-6 rounded-lg border border-dashed border-saas-border bg-white/5 py-10 text-center">
          <p className="text-sm text-slate-400">
            Generate an email to start the Draft → Approve → Send workflow
          </p>
        </div>
      )}
    </div>
  );
}

function outreachToWorkflowStep(status: OutreachStatus): WorkflowStep {
  if (status === "Drafted") return "drafted";
  if (status === "Approved") return "approved";
  return "sent";
}
