import type { EmailCtaConfig } from "./email-template";
import { DEFAULT_EMAIL_CTA_CONFIG } from "./email-template";

export interface ParsedEmail {
  subject: string;
  body: string;
}

export function parseOutreachEmail(content: string): ParsedEmail {
  const subjectMatch = content.match(/^Subject:\s*(.+)$/m);
  const subject = subjectMatch
    ? subjectMatch[1].trim()
    : "Outreach from LeadLens AI";

  const body = content
    .replace(/^Subject:\s*.+\n*/m, "")
    .trim();

  return { subject, body };
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
  leadName?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  configured?: boolean;
}

export async function sendEmailViaApi(
  payload: SendEmailPayload
): Promise<SendEmailResult> {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      success: false,
      error: data.error ?? "Failed to send email",
      configured: data.configured,
    };
  }

  return {
    success: true,
    messageId: data.messageId,
    configured: true,
  };
}

export async function getEmailServiceStatus(): Promise<{
  configured: boolean;
  fromEmail: string | null;
  replyToEmail: string | null;
}> {
  try {
    const res = await fetch("/api/system-status", { cache: "no-store" });
    if (!res.ok) return { configured: false, fromEmail: null, replyToEmail: null };
    const status = await res.json();
    if (!status.resendReady) {
      return { configured: false, fromEmail: null, replyToEmail: null };
    }
    const emailRes = await fetch("/api/email/status", { cache: "no-store" });
    if (!emailRes.ok) {
      return { configured: true, fromEmail: null, replyToEmail: null };
    }
    const emailData = await emailRes.json();
    return {
      configured: true,
      fromEmail: emailData.fromEmail ?? null,
      replyToEmail: emailData.replyToEmail ?? null,
    };
  } catch {
    return { configured: false, fromEmail: null, replyToEmail: null };
  }
}

const TEST_EMAIL_KEY = "leadlens-test-email";

export function getSavedTestEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TEST_EMAIL_KEY) ?? "";
}

export function saveTestEmail(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEST_EMAIL_KEY, email);
}

export interface OutreachDraft {
  subject: string;
  body: string;
  ctaConfig?: EmailCtaConfig;
  updatedAt: string;
}

function outreachDraftKey(leadId: string) {
  return `leadlens-outreach-draft-${leadId}`;
}

export function saveOutreachDraft(
  leadId: string,
  draft: { subject: string; body: string; ctaConfig?: EmailCtaConfig }
): void {
  if (typeof window === "undefined") return;
  const existing = getOutreachDraft(leadId);
  const payload: OutreachDraft = {
    subject: draft.subject,
    body: draft.body,
    ctaConfig: draft.ctaConfig ?? existing?.ctaConfig ?? DEFAULT_EMAIL_CTA_CONFIG,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(outreachDraftKey(leadId), JSON.stringify(payload));
}

export function getOutreachDraft(leadId: string): OutreachDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(outreachDraftKey(leadId));
    return raw ? (JSON.parse(raw) as OutreachDraft) : null;
  } catch {
    return null;
  }
}

export function composeOutreachEmail(subject: string, body: string): string {
  return `Subject: ${subject.trim()}\n\n${body.trim()}`;
}
