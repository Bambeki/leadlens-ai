"use client";

import { useEffect, useState } from "react";
import type { Lead } from "@/lib/types";
import { generateOutreachEmail } from "@/lib/outreach";
import {
  MEETING_OPTIONS,
  insertMeetingSuggestionIntoBody,
  type MeetingType,
} from "@/lib/meeting-suggestions";
import {
  sendEmailViaApi,
  getSavedTestEmail,
  saveTestEmail,
  saveOutreachDraft,
  getOutreachDraft,
} from "@/lib/email";
import {
  DEFAULT_EMAIL_CTA_CONFIG,
  prepareEmailPayload,
} from "@/lib/email-template";
import { fetchSystemStatus } from "@/lib/system-status-client";
import {
  CRM_UPDATED_EVENT,
  getOutreachStatus,
  updateOutreachStatus,
  addActivity,
  hasOutreachBeenSent,
  SENT_OUTREACH_STATUSES,
  type OutreachStatus,
} from "@/lib/crm-store";
import {
  CONVERSATION_UPDATED_EVENT,
  getConversationMessages,
  addOutboundSentMessage,
  addSimulatedCustomerReply,
  type ConversationMessage,
} from "@/lib/conversation-store";
import { processEmailSent, simulateWebhookEvent } from "@/lib/event-automation";
import { useHasMounted } from "@/hooks/useHasMounted";
import Button from "./ui/Button";

const SENDER_NAME = "Marcus Weber · FleetBrand Pro";

const MEETING_BUTTONS: { type: MeetingType; label: string }[] = [
  { type: "consultation-15", label: "Suggest 15-minute call" },
  { type: "discovery-30", label: "Suggest 30-minute call" },
  { type: "onsite-audit", label: "Suggest on-site audit" },
];

type ComposerStep = "draft" | "approved" | "sent";

function getStatusFlags(status: OutreachStatus | null) {
  const sent =
    status != null && SENT_OUTREACH_STATUSES.includes(status);
  const opened =
    status != null &&
    ["Opened", "Replied", "Meeting Suggested", "Meeting Accepted", "Meeting Scheduled", "Meeting Declined"].includes(
      status
    );
  const replied =
    status != null &&
    ["Replied", "Meeting Suggested", "Meeting Accepted", "Meeting Scheduled"].includes(
      status
    );
  const meetingRequested =
    status != null &&
    ["Meeting Suggested", "Meeting Accepted", "Meeting Scheduled"].includes(
      status
    );
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
          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
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
  const [composerStep, setComposerStep] = useState<ComposerStep>("draft");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [outreachStatus, setOutreachStatus] = useState<OutreachStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [useTestEmail, setUseTestEmail] = useState(true);
  const [resendReady, setResendReady] = useState(false);
  const [fromEmail, setFromEmail] = useState<string | null>(null);
  const [replyToEmail, setReplyToEmail] = useState<string | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<MeetingType | null>(null);

  function refreshState() {
    setMessages(getConversationMessages(lead.id));
    const status = getOutreachStatus(lead.id);
    setOutreachStatus(status);

    if (status === "Approved") setComposerStep("approved");
    else if (status && SENT_OUTREACH_STATUSES.includes(status)) setComposerStep("sent");
    else setComposerStep("draft");

    const draft = getOutreachDraft(lead.id);
    if (draft && !(status && SENT_OUTREACH_STATUSES.includes(status))) {
      setSubject(draft.subject);
      setBody(draft.body);
    }
  }

  useEffect(() => {
    if (!hasMounted) return;
    setTestEmail(getSavedTestEmail());
    fetchSystemStatus().then((s) => setResendReady(s.resendReady));
    fetch("/api/email/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setFromEmail(d.fromEmail ?? null);
        setReplyToEmail(d.replyToEmail ?? null);
      })
      .catch(() => {});
    refreshState();

    const onUpdate = () => refreshState();
    window.addEventListener(CRM_UPDATED_EVENT, onUpdate);
    window.addEventListener(CONVERSATION_UPDATED_EVENT, onUpdate);
    return () => {
      window.removeEventListener(CRM_UPDATED_EVENT, onUpdate);
      window.removeEventListener(CONVERSATION_UPDATED_EVENT, onUpdate);
    };
  }, [lead.id, hasMounted]);

  const statusFlags = getStatusFlags(outreachStatus);
  const isEditable = composerStep === "draft";
  const isComposerLocked = composerStep !== "draft";
  const canSend = composerStep === "approved" && resendReady;

  function handleGenerate() {
    setIsGenerating(true);
    setSendError(null);
    setTimeout(() => {
      const generated = generateOutreachEmail(
        lead,
        typeof window !== "undefined" ? window.location.origin : undefined
      );
      const subjectMatch = generated.match(/^Subject:\s*(.+)$/m);
      const newSubject = subjectMatch
        ? subjectMatch[1].trim()
        : `Elevate ${lead.businessName}'s Brand Presence`;
      const newBody = generated.replace(/^Subject:\s*.+\n*/m, "").trim();
      setSubject(newSubject);
      setBody(newBody);
      setComposerStep("draft");
      setActiveMeeting(null);
      saveOutreachDraft(lead.id, { subject: newSubject, body: newBody });
      updateOutreachStatus(lead.id, "Drafted");
      addActivity(lead.id, "email_drafted", "Email drafted in Communication Center");
      setIsGenerating(false);
    }, 900);
  }

  function handleApprove() {
    if (!subject.trim() || !body.trim()) return;
    saveOutreachDraft(lead.id, { subject, body });
    setComposerStep("approved");
    updateOutreachStatus(lead.id, "Approved");
    addActivity(lead.id, "email_approved", "Email approved for sending");
    setSendError(null);
  }

  async function handleSend() {
    if (composerStep !== "approved") return;

    const recipient = useTestEmail ? testEmail.trim() : lead.contact.email;
    if (!recipient) {
      setSendError("Enter a test email address for the demo send.");
      return;
    }

    if (!resendReady) {
      setSendError(
        "Demo mode — add RESEND_API_KEY and RESEND_FROM_EMAIL to .env.local to send live emails."
      );
      return;
    }

    saveTestEmail(testEmail);
    setIsSending(true);
    setSendError(null);

    const draft = getOutreachDraft(lead.id);
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const prepared = prepareEmailPayload({
      subject: subject.trim(),
      body: body.trim(),
      leadId: lead.id,
      baseUrl,
      ctaConfig: draft?.ctaConfig ?? DEFAULT_EMAIL_CTA_CONFIG,
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

    setComposerStep("sent");
    processEmailSent(lead.id, recipient);
    addOutboundSentMessage(lead.id, {
      subject: subject.trim(),
      body: body.trim(),
      author: SENDER_NAME,
      messageId: result.messageId,
    });
    setOutreachStatus(getOutreachStatus(lead.id));
    setMessages(getConversationMessages(lead.id));
  }

  function handleMeetingProposal(type: MeetingType) {
    const updated = insertMeetingSuggestionIntoBody(body, type);
    setBody(updated);
    setActiveMeeting(type);
    saveOutreachDraft(lead.id, { subject, body: updated });
    updateOutreachStatus(lead.id, "Meeting Suggested");
    addActivity(lead.id, "meeting_scheduled", `Meeting proposal added: ${MEETING_OPTIONS.find((m) => m.id === type)?.shortLabel}`);
    if (composerStep === "approved") setComposerStep("draft");
    setOutreachStatus("Meeting Suggested");
  }

  function handleSimulateOpened() {
    if (!hasOutreachBeenSent(lead.id)) {
      setSendError("Send an email first before simulating opens.");
      return;
    }
    setSendError(null);
    simulateWebhookEvent(lead, "email_opened");
    setOutreachStatus(getOutreachStatus(lead.id));
  }

  function handleSimulateReply() {
    if (!hasOutreachBeenSent(lead.id)) {
      setSendError("Send an email first before simulating a customer reply.");
      return;
    }
    setSendError(null);
    const replyBody = `Hi Marcus,\n\nThank you for reaching out about vehicle branding for ${lead.businessName}. We're interested in fleet wraps and would like to schedule a call to discuss options.\n\nCould we find a time next week?\n\nBest regards,\n${lead.contact.name}\n${lead.contact.role}`;

    simulateWebhookEvent(lead, "customer_replied");
    addSimulatedCustomerReply(lead.id, {
      author: `${lead.contact.name} · ${lead.businessName}`,
      body: replyBody,
    });
    setMessages(getConversationMessages(lead.id));
    setOutreachStatus(getOutreachStatus(lead.id));
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
              Contact {lead.contact.name} at {lead.businessName} — no Gmail or
              Outlook required
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
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            Demo mode — Resend not configured. Draft and approve emails; add
            RESEND_API_KEY to .env.local for live sending.
          </p>
        )}
        {resendReady && (
          <p className="mt-3 text-xs text-slate-400">
            From: {fromEmail ?? "Resend"} · Reply-To:{" "}
            {replyToEmail ?? "not set — add RESEND_REPLY_TO_EMAIL to .env.local"}
          </p>
        )}
      </div>

      {/* Thread */}
      <div className="max-h-[420px] overflow-y-auto border-b border-saas-border bg-white/5 px-5 py-4">
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-slate-300">No messages yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Generate an AI email below to start the conversation thread
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
                      Resend ID: {msg.messageId}
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">
            AI draft — editable before sending
          </span>
          <div className="flex flex-wrap gap-2">
            {composerStep === "draft" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Awaiting approval
              </span>
            )}
            {composerStep === "approved" && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Approved — ready to send
              </span>
            )}
            {composerStep === "sent" && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Sent via Resend
              </span>
            )}
          </div>
        </div>

        {!subject && !body && composerStep === "draft" && (
          <div className="mb-4 rounded-lg border border-dashed border-saas-border bg-white/5 py-8 text-center">
            <p className="text-sm text-slate-400">
              Generate a personalized outreach email to begin
            </p>
            <Button className="mt-3" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating…" : "Generate AI email"}
            </Button>
          </div>
        )}

        {(subject || body || composerStep !== "draft") && (
          <>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (composerStep === "approved") setComposerStep("draft");
              }}
              readOnly={isComposerLocked}
              className="mt-1.5 w-full rounded-lg border border-saas-border bg-saas-card px-4 py-2.5 text-sm focus:border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-white/5"
            />

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (composerStep === "approved") setComposerStep("draft");
              }}
              readOnly={isComposerLocked}
              rows={12}
              className="mt-1.5 w-full resize-y rounded-lg border border-saas-border bg-saas-card px-4 py-3 font-sans text-sm leading-relaxed focus:border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-white/5"
            />

            <p className="mt-2 text-xs text-slate-400">
              Includes customer response links: Request a Call · Choose Meeting
              Time · Not Interested
            </p>

            {isEditable && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                  Meeting proposals
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MEETING_BUTTONS.map((btn) => (
                    <Button
                      key={btn.type}
                      size="sm"
                      variant={activeMeeting === btn.type ? "primary" : "secondary"}
                      onClick={() => handleMeetingProposal(btn.type)}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {composerStep === "approved" && (
              <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 p-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={useTestEmail}
                    onChange={(e) => setUseTestEmail(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Send to my test address (demo)
                </label>
                {useTestEmail && (
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-2 w-full rounded-lg border border-saas-border bg-saas-card px-4 py-2.5 text-sm"
                  />
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Emails are never sent automatically — click Send after approval.
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {isEditable && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    Regenerate
                  </Button>
                  <Button size="sm" onClick={handleApprove}>
                    Approve email
                  </Button>
                </>
              )}
              {composerStep === "approved" && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleSend}
                  disabled={isSending || !canSend}
                >
                  {isSending ? "Sending…" : "Send email"}
                </Button>
              )}
            </div>
          </>
        )}

        {/* Simulated inbox */}
        {composerStep === "sent" && (
          <div className="mt-6 rounded-lg border border-dashed border-violet-200 bg-violet-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Simulated inbox
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Demo customer responses appear in the thread above — no external
              inbox required.
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
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {sendError}
          </p>
        )}
      </div>
    </div>
  );
}
