"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lead } from "@/lib/types";
import {
  MEETING_OPTIONS,
  insertMeetingSuggestionIntoBody,
  type MeetingType,
} from "@/lib/meeting-suggestions";
import {
  sendEmailViaApi,
  getSavedTestEmail,
  saveTestEmail,
  getOutreachDraftFromDb,
  saveOutreachDraftToDb,
} from "@/lib/email";
import { fetchSystemStatus } from "@/lib/system-status-client";
import {
  CRM_UPDATED_EVENT,
  getOutreachStatusFromDb,
  updateOutreachStatus,
  addActivity,
  hasOutreachBeenSent,
  SENT_OUTREACH_STATUSES,
  type OutreachStatus,
} from "@/lib/crm-store";
import {
  CONVERSATION_UPDATED_EVENT,
  getConversationMessagesFromDb,
  addOutboundSentMessage,
  addSimulatedCustomerReply,
  type ConversationMessage,
} from "@/lib/conversation-store";
import {
  DEMO_SIMULATION_ENABLED,
  processEmailSent,
  simulateWebhookEvent,
} from "@/lib/event-automation";
import {
  generateOutreachDraftFromApi,
  type OutreachAssistAction,
} from "@/lib/opportunity-api";
import { useHasMounted } from "@/hooks/useHasMounted";
import { LEADLENS_BRAND } from "@/lib/branding";
import Button from "./ui/Button";

const SENDER_NAME = LEADLENS_BRAND.senderLabel;

const MEETING_BUTTONS: { type: MeetingType; label: string }[] = [
  { type: "consultation-15", label: "Suggest 15-minute call" },
  { type: "discovery-30", label: "Suggest 30-minute call" },
  { type: "onsite-audit", label: "Suggest on-site audit" },
];

type ComposerStep = "draft" | "approved" | "sent";

const AI_ACTIONS: {
  action: OutreachAssistAction;
  label: string;
  needsContent?: boolean;
}[] = [
  { action: "generate", label: "Generate Draft" },
  { action: "improve", label: "Improve Writing", needsContent: true },
  { action: "professional", label: "Make More Professional", needsContent: true },
  { action: "shorter", label: "Make Shorter", needsContent: true },
  { action: "rewrite", label: "Rewrite", needsContent: true },
  { action: "personalize", label: "Personalize for Lead", needsContent: true },
];

function getStatusFlags(status: OutreachStatus | null) {
  const sent = status != null && SENT_OUTREACH_STATUSES.includes(status);
  const opened = status === "Opened";
  const replied = status === "Replied";
  const meetingRequested =
    status === "Meeting Accepted" || status === "Meeting Scheduled";
  return { sent, opened, replied, meetingRequested };
}

function formatThreadTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusPill({
  label,
  active,
  icon,
}: {
  label: string;
  active: boolean;
  icon: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
          : "bg-white/10 text-slate-400"
      }`}
    >
      <span>{icon}</span>
      {label}
    </span>
  );
}

export default function ConversationCenter({ lead }: { lead: Lead }) {
  const hasMounted = useHasMounted();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [composerStep, setComposerStep] = useState<ComposerStep>("draft");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [outreachStatus, setOutreachStatus] = useState<OutreachStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [assistAction, setAssistAction] = useState<OutreachAssistAction | null>(null);
  const [assistNotice, setAssistNotice] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [useTestEmail, setUseTestEmail] = useState(true);
  const [resendReady, setResendReady] = useState(false);
  const [fromEmail, setFromEmail] = useState<string | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<MeetingType | null>(null);

  const refreshState = useCallback(async () => {
    setMessages(await getConversationMessagesFromDb(lead.id));
    const status = await getOutreachStatusFromDb(lead.id);
    setOutreachStatus(status);

    if (status === "Approved") setComposerStep("approved");
    else if (status && SENT_OUTREACH_STATUSES.includes(status)) setComposerStep("sent");
    else setComposerStep("draft");

    const draft = await getOutreachDraftFromDb(lead.id);
    if (draft && !(status && SENT_OUTREACH_STATUSES.includes(status))) {
      setSubject(draft.subject);
      setBody(draft.body);
      setFollowUp("");
    }
  }, [lead.id]);

  useEffect(() => {
    if (!hasMounted) return;
    const timeout = window.setTimeout(() => {
      setTestEmail(getSavedTestEmail());
      refreshState();
    }, 0);
    fetchSystemStatus().then((s) => setResendReady(s.resendReady));
    fetch("/api/email/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setFromEmail(d.fromEmail ?? null);
      })
      .catch(() => {});

    const onUpdate = () => refreshState();
    window.addEventListener(CRM_UPDATED_EVENT, onUpdate);
    window.addEventListener(CONVERSATION_UPDATED_EVENT, onUpdate);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(CRM_UPDATED_EVENT, onUpdate);
      window.removeEventListener(CONVERSATION_UPDATED_EVENT, onUpdate);
    };
  }, [hasMounted, refreshState]);

  const statusFlags = getStatusFlags(outreachStatus);
  const isEditable = composerStep !== "sent";
  const isComposerLocked = composerStep === "sent";
  const recipient = useTestEmail ? testEmail.trim() : lead.contact.email;
  const canSend = resendReady && !isComposerLocked;

  async function handleAiAssist(action: OutreachAssistAction) {
    const actionConfig = AI_ACTIONS.find((item) => item.action === action);
    const hasContent = Boolean(subject.trim() || body.trim());
    if (actionConfig?.needsContent && !hasContent) {
      setAssistNotice("Write a message first, or use Generate Draft to start from lead context.");
      return;
    }

    setIsGenerating(true);
    setAssistAction(action);
    setSendError(null);
    setAssistNotice(null);
    setSendSuccess(null);

    try {
      const draft = await generateOutreachDraftFromApi(lead.id, {
        action,
        subject,
        body,
      });
      setSubject(draft.subject);
      setBody(draft.body);
      setFollowUp(draft.followUp);
      setComposerStep("draft");
      setActiveMeeting(null);
      addActivity(
        lead.id,
        "email_drafted",
        action === "generate"
          ? "Email draft generated in Communication Center"
          : "Email draft updated with AI assist"
      );
      setGenerateSuccess(true);
      setAssistNotice(
        draft.warning ??
          (draft.source === "fallback"
            ? "AI assistance is unavailable, so LeadLens used the local fallback."
            : "AI-generated draft updated. Review and edit before sending.")
      );
      setTimeout(() => setGenerateSuccess(false), 2000);
    } catch (error) {
      setAssistNotice(
        error instanceof Error && error.message
          ? `Draft was not saved. ${error.message}`
          : "AI assistance is unavailable right now. Your current draft is unchanged and you can keep writing manually."
      );
    } finally {
      setIsGenerating(false);
      setAssistAction(null);
    }
  }

  async function handleSaveDraft(status: Extract<OutreachStatus, "Drafted" | "Approved"> = "Drafted") {
    if (!subject.trim() || !body.trim()) {
      setSendError("Add a subject and message before saving.");
      return;
    }
    setSendError(null);
    setAssistNotice(null);
    try {
      await saveOutreachDraftToDb(lead.id, { subject, body }, status);
      if (status === "Approved") {
        await updateOutreachStatus(lead.id, "Approved");
        setComposerStep("approved");
        addActivity(lead.id, "email_approved", "Email approved for sending");
      } else {
        await updateOutreachStatus(lead.id, "Drafted");
        setComposerStep("draft");
      }
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 2000);
    } catch {
      setSendError("Could not save the draft to the database. You can keep editing locally.");
    }
  }

  async function handleApprove() {
    if (!subject.trim() || !body.trim()) return;
    await handleSaveDraft("Approved");
  }

  async function handleSend() {
    if (!recipient) {
      setSendError(
        useTestEmail
          ? "Enter a test email address before sending."
          : "This lead does not have a recipient email."
      );
      return;
    }

    if (!subject.trim()) {
      setSendError("Add a subject before sending.");
      return;
    }

    if (!body.trim()) {
      setSendError("Add a message before sending.");
      return;
    }

    if (!resendReady) {
      setSendError(
        "Email delivery is not connected yet. Visit Email Center to enable live sending."
      );
      return;
    }

    saveTestEmail(testEmail);
    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    const result = await sendEmailViaApi({
      to: recipient,
      subject: subject.trim(),
      body: body.trim(),
      leadName: lead.businessName,
    });

    if (!result.success) {
      setIsSending(false);
      setSendError(result.error ?? "Send failed");
      return;
    }

    try {
      await addOutboundSentMessage(lead.id, {
        subject: subject.trim(),
        body: body.trim(),
        author: SENDER_NAME,
        messageId: result.messageId,
      });
      await processEmailSent(lead.id, recipient);
      setComposerStep("sent");
      setOutreachStatus(await getOutreachStatusFromDb(lead.id));
      setMessages(await getConversationMessagesFromDb(lead.id));
      setSendSuccess(`Email sent to ${recipient}.`);
    } catch {
      setSendError("Email was sent, but LeadLens could not save the conversation to the database.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleMeetingProposal(type: MeetingType) {
    const updated = insertMeetingSuggestionIntoBody(body, type);
    setBody(updated);
    setActiveMeeting(type);
    setSendError(null);
    try {
      await saveOutreachDraftToDb(lead.id, { subject, body: updated }, "Drafted");
      addActivity(
        lead.id,
        "email_drafted",
        `Meeting proposal added to draft: ${MEETING_OPTIONS.find((m) => m.id === type)?.shortLabel}`
      );
      if (composerStep === "approved") setComposerStep("draft");
      setOutreachStatus(await getOutreachStatusFromDb(lead.id));
    } catch {
      setSendError("Could not save the meeting proposal to the database.");
    }
  }

  function handleSimulateOpened() {
    if (!DEMO_SIMULATION_ENABLED) {
      setSendError("Open tracking is not configured.");
      return;
    }
    if (!hasOutreachBeenSent(lead.id)) {
      setSendError("Send an email first before simulating opens.");
      return;
    }
    setSendError(null);
    simulateWebhookEvent(lead, "email_opened").then(async () => {
      setOutreachStatus(await getOutreachStatusFromDb(lead.id));
    }).catch(() => setSendError("Could not save opened event to the database."));
  }

  function handleSimulateReply() {
    if (!DEMO_SIMULATION_ENABLED) {
      setSendError("Inbound reply integration is not configured.");
      return;
    }
    if (!hasOutreachBeenSent(lead.id)) {
      setSendError("Send an email first before simulating a customer reply.");
      return;
    }
    setSendError(null);
    const replyBody = `Hi ${LEADLENS_BRAND.senderLabel},\n\nThank you for reaching out about vehicle branding for ${lead.businessName}. We're interested in vehicle wraps and would like to schedule a call to discuss options.\n\nCould we find a time next week?\n\nBest regards,\n${lead.contact.name}\n${lead.contact.role}`;

    simulateWebhookEvent(lead, "customer_replied")
      .then(() =>
        addSimulatedCustomerReply(lead.id, {
          author: `${lead.contact.name} · ${lead.businessName}`,
          body: replyBody,
        })
      )
      .then(async () => {
        setMessages(await getConversationMessagesFromDb(lead.id));
        setOutreachStatus(await getOutreachStatusFromDb(lead.id));
      })
      .catch(() => setSendError("Could not save simulated reply to the database."));
  }

  if (!hasMounted) {
    return (
      <div className="overflow-hidden rounded-xl border border-saas-border bg-saas-card shadow-sm">
        <div className="border-b border-saas-border bg-white/5 px-5 py-4">
          <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
        </div>
        <div className="space-y-4 p-5">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-saas-border bg-saas-card shadow-sm">
      {/* Inbox header */}
      <div className="border-b border-saas-border bg-gradient-to-r from-saas-card to-violet-500/10 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Customer Communication Center
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">
              Editable outreach workspace for {lead.businessName}
            </p>
          </div>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
            {lead.contact.email}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill label="Sent" active={statusFlags.sent} icon="✉" />
          <StatusPill label="Opened" active={statusFlags.opened} icon="◉" />
          <StatusPill label="Reply" active={statusFlags.replied} icon="↩" />
          <StatusPill
            label="Meeting requested"
            active={statusFlags.meetingRequested}
            icon="📅"
          />
        </div>

        {!resendReady && (
          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
            Draft and approve emails here. Connect your email in Email Center to send live.
          </p>
        )}
        {resendReady && (
          <div className="mt-3 space-y-1 text-xs text-slate-400">
            <p>Sending from {fromEmail ?? "your connected account"}</p>
            <p>Open tracking not configured. Inbound reply integration not configured.</p>
          </div>
        )}
        {generateSuccess && (
          <p className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
            Outreach draft updated and saved to the database.
          </p>
        )}
        {saveFeedback && (
          <p className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
            Draft saved.
          </p>
        )}
        {assistNotice && (
          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
            {assistNotice}
          </p>
        )}
        {sendSuccess && (
          <p className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
            {sendSuccess}
          </p>
        )}
      </div>

      {/* Thread */}
      <div className="max-h-[420px] overflow-y-auto border-b border-saas-border bg-white/5 px-5 py-4">
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-slate-300">No messages yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Write manually or use AI Assist below to start the conversation thread
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.direction === "outbound"
                      ? "rounded-br-md bg-violet-600 text-white"
                      : "rounded-bl-md border border-saas-border bg-saas-card text-slate-300"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        msg.direction === "outbound"
                          ? "text-violet-100"
                          : "text-slate-400"
                      }`}
                    >
                      {msg.author}
                    </span>
                    <span
                      className={`text-[10px] ${
                        msg.direction === "outbound"
                          ? "text-violet-200"
                          : "text-slate-400"
                      }`}
                    >
                      {formatThreadTime(msg.timestamp)}
                    </span>
                  </div>
                  {msg.subject && (
                    <p
                      className={`mt-1 text-sm font-semibold ${
                        msg.direction === "outbound" ? "text-white" : "text-white"
                      }`}
                    >
                      {msg.subject}
                    </p>
                  )}
                  <pre
                    className={`mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed ${
                      msg.direction === "outbound" ? "text-violet-50" : "text-slate-300"
                    }`}
                  >
                    {msg.body}
                  </pre>
                  {msg.messageId && (
                    <p className="mt-2 font-mono text-[10px] text-violet-200">
                      Message ID: {msg.messageId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-300">
            Editable email workspace
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              composerStep === "sent"
                ? "bg-blue-500/15 text-blue-300"
                : composerStep === "approved"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300"
            }`}
          >
            {composerStep === "sent"
              ? "Sent"
              : composerStep === "approved"
                ? "Saved as approved"
                : "Draft editor"}
          </span>
        </div>

        <section className="rounded-xl border border-saas-border bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Recipient
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.2fr]">
            <div className="rounded-lg border border-saas-border bg-saas-card p-3">
              <p className="text-sm font-semibold text-white">
                {lead.contact.name || "Contact pending"}
              </p>
              <p className="mt-1 text-xs text-slate-400">{lead.contact.role}</p>
              <p className="mt-2 break-all text-xs text-violet-300">
                {lead.contact.email || "No lead email saved"}
              </p>
            </div>
            <div className="rounded-lg border border-saas-border bg-saas-card p-3">
              <p className="text-sm font-semibold text-white">{lead.businessName}</p>
              <p className="mt-1 text-xs text-slate-400">
                {lead.industry} · {lead.location}, {lead.city}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Score{" "}
                <span className="font-semibold text-violet-300">
                  {lead.scoreBreakdown.total}/100
                </span>{" "}
                · CRM{" "}
                <span className="font-semibold text-violet-300">
                  {lead.crmStatus}
                </span>
              </p>
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={useTestEmail}
              onChange={(e) => setUseTestEmail(e.target.checked)}
              className="rounded border-slate-300"
              disabled={isSending}
            />
            Send to my test address
          </label>
          {useTestEmail ? (
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="saas-input mt-2 w-full px-4 py-2.5 text-sm"
              disabled={isSending}
            />
          ) : (
            <p className="mt-2 text-xs text-slate-400">
              Sending to saved lead contact:{" "}
              <span className="font-medium text-slate-300">
                {lead.contact.email || "No email available"}
              </span>
            </p>
          )}
        </section>

        <section className="mt-4 rounded-xl border border-saas-border bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Lead Context
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Opportunity Signals
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {lead.valuableReasons.slice(0, 3).map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Evidence
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {lead.evidenceSources.slice(0, 3).map((source) => (
                  <li key={`${source.sourceName}-${source.evidenceSummary}`}>
                    • {source.sourceName}: {source.evidenceSummary}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                AI Assist
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Optional. These actions use the current editor content and lead context.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {AI_ACTIONS.map((item) => (
              <Button
                key={item.action}
                size="sm"
                variant={item.action === "generate" ? "primary" : "secondary"}
                onClick={() => handleAiAssist(item.action)}
                disabled={isGenerating || isSending || isComposerLocked}
              >
                {isGenerating && assistAction === item.action
                  ? "Working..."
                  : item.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-saas-border bg-white/5 p-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setSendSuccess(null);
              if (composerStep === "approved") setComposerStep("draft");
            }}
            readOnly={isComposerLocked}
            placeholder={`Outreach for ${lead.businessName}`}
            className="saas-input mt-1.5 w-full px-4 py-2.5 text-sm disabled:bg-white/5"
          />

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSendSuccess(null);
              if (composerStep === "approved") setComposerStep("draft");
            }}
            readOnly={isComposerLocked}
            rows={14}
            placeholder={`Write a message to ${lead.contact.name || lead.businessName}...`}
            className="saas-input mt-1.5 w-full resize-y px-4 py-3 font-sans text-sm leading-relaxed disabled:bg-white/5"
          />

          <p className="mt-2 text-xs text-slate-400">
            The subject and message are sent exactly as edited. Meeting proposals
            insert LeadLens response links, not external video meeting links.
          </p>

          {followUp && (
            <div className="mt-4 rounded-lg border border-saas-border bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                Optional follow-up generated
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
                {followUp}
              </pre>
            </div>
          )}
        </section>

        {isEditable && (
          <section className="mt-4 rounded-xl border border-saas-border bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
              Meeting Workflow
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Insert a meeting proposal into the current message when useful.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {MEETING_BUTTONS.map((btn) => (
                <Button
                  key={btn.type}
                  size="sm"
                  variant={activeMeeting === btn.type ? "primary" : "secondary"}
                  onClick={() => handleMeetingProposal(btn.type)}
                  disabled={isSending}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-4 rounded-xl border border-saas-border bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Send
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSaveDraft("Drafted")}
              disabled={isSending || isGenerating || isComposerLocked}
            >
              {saveFeedback ? "Saved!" : "Save Draft"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleApprove}
              disabled={isSending || isGenerating || isComposerLocked}
            >
              Save as Approved
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleSend}
              disabled={isSending || isGenerating || !canSend}
            >
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </div>
          {!resendReady && (
            <p className="mt-3 text-xs text-amber-300">
              Resend is not configured. You can keep writing and saving drafts,
              but live sending is disabled.
            </p>
          )}
        </section>

        {/* Developer-only simulated inbox */}
        {DEMO_SIMULATION_ENABLED && composerStep === "sent" && (
          <div className="mt-6 rounded-lg border border-dashed border-violet-500/25 bg-violet-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
              Demo / Developer Simulation
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Trigger simulated response events for local testing. These are not
              real customer actions or provider webhooks.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={handleSimulateOpened}>
                Simulate email opened
              </Button>
              <Button size="sm" variant="primary" onClick={handleSimulateReply}>
                Simulate customer reply
              </Button>
            </div>
          </div>
        )}

        {sendError && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300">
            {sendError}
          </p>
        )}
      </div>
    </div>
  );
}
